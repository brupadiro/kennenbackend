const axios = require("axios");
const qs = require("qs");

class AxiosHelper {
  constructor(apiToken, baseUrl) {
    this.config = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiToken}:`).toString("base64")}`
      },
      
    };
    this.baseUrl = baseUrl;
  }

  async getRequest(url, params = {}) {
    const apiUrl = `${this.baseUrl}${url}`;

    this.config = {
      ...this.config,
      paramsSerializer: function (params) {
        return qs.stringify(params);
      },
      params:params,
    }

    const response = await axios.get(apiUrl, this.config);
    return response;
  }
}

module.exports = AxiosHelper;
