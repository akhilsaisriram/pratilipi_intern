const axios = require('axios');
const { BASE_URL } = process.env;

class OrderService {
  constructor(token = null) {
    this.client = axios.create({
      baseURL: `${BASE_URL}:3002`,
      headers: token ? { Authorization: token } : {}

    });
  }

  async getOrdersByUser(userId, nondelivered = false) {
    try {
      const response = await this.client.get(`order/order/${userId}`, { params: { nondelivered } });
      console.log(response.data.data)
      return response.data.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOrderById(orderId) {
    try {
      const response = await this.client.get(`order/${orderId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createOrder(orderData) {
    try {
      const response = await this.client.post('order/', orderData);
      // console.log(response.data.order);
      
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }



  async deleteOrder(orderId) {
    try {
      const response = await this.client.delete(`order/${orderId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error from order service');
    } else if (error.request) {
      throw new Error('Order service is not responding');
    } else {
      throw new Error('Error setting up request to order service');
    }
  }
}

module.exports = { OrderService };