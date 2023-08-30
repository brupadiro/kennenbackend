const axios = require("axios");
const qs = require("qs");
const PrestaShopAPI = require("../services/helpers/prestashop-api");


module.exports = {

  async orderList(ctx) {
    try {
      const {
        id
      } = ctx.params;

      const store = await strapi.db.query('api::webservice.webservice').findOne({
        where: {
          id
        }
      });
      const API = new PrestaShopAPI(store.apiKey, store.url);
      var response = await API.getCustomEndpoint(ctx);
      const idOrders = await Promise.all(response.data.orders.map(async (order) => {
        return order.order.id
      }))

      const extraInfoOrders = await strapi.db.query('api::order.order').findMany({
        where: {
          order_id: {
            $in: idOrders
          }
        },
      });

      const extraInfoIdOrders = await Promise.all(extraInfoOrders.map((e) => e.id))
      const incidentsOrders = await strapi.db.query('api::incident.incident').findMany({
        where: {
          order: {
              id: {
                $in: extraInfoIdOrders
              }
          }
        },
        populate: {
          order:{
            id:true
          }
        }
      });
      console.log(incidentsOrders)
      response.data.orders = await Promise.all(response.data.orders.map(async (order) => {
        let extra = extraInfoOrders.find((e) => e.order_id == order.order.id && e.product_id == order.product.id)
        if (extra) {
          let incidents = incidentsOrders.filter((e) => e.order.id == extra.id)  
          console.log(incidents)
          extra = {
            extra_id: extra.id,
            track_id: extra.track_id,
            tracking_number: extra.tracking_number,
            net_price: extra.net_price,
            incidents: incidents
          }
        }
        return {
          ...order,
          product: {
            ...order.product,
            ...extra
          }
        }
      }))
      return response.data;
    } catch (err) {
      console.log(err)
      return []
    }
  },


  async order(ctx) {
    const {
      idstore,
      id
    } = ctx.params;


    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id: idstore
      }
    });


    const API = new PrestaShopAPI(store.apiKey, store.url);


    const order = await API.getOrderInfo(id)

    const orderExtraData = await strapi.db.query('api::order.order').findOne({
      where: {
        order_id: id
      }
    });

    return {
      ...order,
      extra: orderExtraData ?? {}
    }

  },


  async update(ctx) {
    const data = ctx.request.body;
    const {
      id
    } = ctx.params;
    // Buscar pedido existente
    console.log(data)
    console.log(id)
    let order = await strapi.db.query('api::order.order').findOne({
      where: {
        order_id: id
      }
    });

    if (!order) {
      console.log(data)
      // Crear pedido si no existe
      order = await strapi.db.query('api::order.order').create(data);
    } else {
      // Actualizar pedido existente
      const idstore = order.id;
      order = await strapi.db.query('api::order.order').update({
        where: {
          id: idstore
        }
      }, data);
    }

    return order;

  },


  async orderListAllStores(ctx) {


    const {
      user
    } = ctx.state
    const {
      company
    } = ctx.request.query
    const stores = await strapi.db.query('api::webservice.webservice').findMany({
      where: {
        company: company
      },
    });
    const orders = await Promise.all(stores.map(async (store) => {
      const storeOrders = await this.orderList({
        request: {
          query: ctx.request.query
        },
        params: {
          id: store.id
        }
      });
      // Agregamos el nombre de la tienda a cada pedido
      storeOrders.orders.forEach(order => order.storeName = store.name);
      storeOrders.orders.forEach(order => order.storeId = store.id);
      storeOrders.total_pages = storeOrders.total_pages ?? 0
      storeOrders.total_count = storeOrders.total_count ?? 0
      return storeOrders

    }));
    // Extraemos los pedidos de cada tienda en un solo array

    // Agregamos esta línea para extraer la fecha de cada pedido
    const allOrders = orders.reduce(
      (accumulator, current) => {
        accumulator.orders.push(...current.orders);
        accumulator.total_pages += current.total_pages;
        accumulator.total_count += parseInt(current.total_count);
        return accumulator;
      }, {
        orders: [],
        total_pages: 0,
        total_count: 0
      }
    )
    allOrders.orders = allOrders.orders.sort((a, b) => {
      const dateA = new Date(a.order.date_add);
      const dateB = new Date(b.order.date_add);
      return dateB -dateA ;
    });
  
    return allOrders;
  

    },
  async payments(ctx) {
    const {
      method
    } = ctx.query;
    const {
      id
    } = ctx.params;
    // Hacemos la petición GET a la API de PrestaShop
    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id
      }
    });
    const API = new PrestaShopAPI(store.apiKey, store.url);
    const response = await API.getStats(ctx);
    return response.data

  },
  async customers(ctx) {
    const {
      page,
      state
    } = ctx.query;

    const {
      id
    } = ctx.params;
    const store = await strapi.db.query('api::webservice.webservice').findOne({
      where: {
        id: id
      },
    });
    var limit = 10
    if (ctx.query.pagination.page) {
      let startItems = (ctx.query.pagination.page - 1) * 10
      limit = `${startItems},10`
    }
    console.log(limit)


    // Configuración para conectarnos a la API de PrestaShop
    const apiKey = store.apiKey;
    const apiUrl = `${store.url}/api/customers`;
    const config = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`
      },
      params: {
        output_format: "JSON",
        display: "full",
        limit: limit,
        sort: "id_DESC"
      },
      paramsSerializer: function (params) {
        return qs.stringify(params, {
          arrayFormat: "brackets"
        });
      },

    };
    // Hacemos la petición GET a la API de PrestaShop
    var customers = []
    try {
      const response = await axios.get(apiUrl, config);
      customers = response.data.customers
    } catch (err) {
      console.log("error", err.response.data)
    }

    return customers;

  }
}
