const axios = require("axios");
const { BASE_URL } = process.env;

class NotificationService {
  constructor(token = null) {
    console.log('====================================');
    console.log(token);
    console.log('====================================');
    this.client = axios.create({
      baseURL: `${BASE_URL}:3001`,
      headers: token ? { Authorization: token } : {}
    });
  }



  async getunreadnotifications(userId,read) {
    console.log(userId,read)
    const res=await this.sendRequest("get", `/notification/${userId}/${read}`);
    // console.log("notify",res.data)
    return res.data
  }






  async sendRequest(method, url, payload = {}) {
    try {
      const config = {
        method,
        url,
      };
  
      if (method.toLowerCase() === 'get' && payload.params) {
        config.params = payload.params;
      } else if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = payload;
      }
  
      const response = await this.client(config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  

  handleError(error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Error from notification service");
    } else if (error.request) {
      throw new Error("Notification service is not responding");
    } else {
      throw new Error("Error setting up request to notification service");
    }
  }
}

module.exports = {NotificationService};
