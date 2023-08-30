'use strict';
const {
  createCoreService
} = require('@strapi/strapi').factories;

const axios = require('axios');
const AFTERSHIP_API_KEY = "asat_8dc9c57908dc4f0a9ff61ae8f39d213b";
module.exports = createCoreService('api::order.order', ({
  strapi
}) => {
  return {
    async createTrackingInAfterShip(orderData) {
      const url = "https://api.aftership.com/v4/trackings";
      const headers = {
        "aftership-api-key": AFTERSHIP_API_KEY,
        "Content-Type": "application/json"
      };

      try {
        const trackingData = {
          "tracking": {
            "slug": "china-post",
            "tracking_number": orderData.tracking_number,
            "title": orderData.complete_order_data.product.name,
            "order_id": orderData.order_id,
            "customer_name": orderData.complete_order_data.customer.name,
            "custom_fields": {
              "product_id": orderData.product_id,
              "store_id": orderData.store_id,
              "email": orderData.complete_order_data.customer.email,
              "order_total_paid": orderData.complete_order_data.order.total_paid,
              "delivery_address": `${orderData.complete_order_data.delivery_address.address1} ${orderData.complete_order_data.delivery_address.postcode} ${orderData.complete_order_data.delivery_address.city}, ${orderData.complete_order_data.delivery_address.state}, ${orderData.complete_order_data.delivery_address.country}`
            },
            emails: [orderData.complete_order_data.customer.email],
          }
        };

        const data = await axios.post(url, trackingData, {
          headers: headers
        });
        console.log(data)
        if (data.status === 201) {
          console.log("Tracking created successfully in AfterShip");
        } else {
          console.log(`Error creating tracking in AfterShip: ${response.status}, ${response.text}`);
        }
        return data;
      } catch (error) {
        console.error(error);
        console.error(error.response.data);
      }
    }
  }
});
