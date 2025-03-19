const axios = require('axios');
const { BASE_URL } = process.env;

class userservice {
  constructor(token = null) {
   console.log('====================================');
   console.log("base",process.env.BASE_URL);
   console.log('====================================');
    this.client = axios.create({
      baseURL: `${process.env.BASE_URL}:3000`,
      headers: token ? { Authorization: token } : {}
    });
  }

  async register(userData) {
    try {
      const response = await this.client.post('/users/register', userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(credentials) {
    console.log(credentials);
    
    try {
      const response = await this.client.post('/users/login', credentials);
      console.log(response.data);
      
      return response.data;
    } catch (error) {
        console.log(error);
        
      this.handleError(error);
    }
  }

  async getuser(id) {
    try {
      const response = await this.client.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateuser(userData,id) {
    try {
      const response = await this.client.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteuser(id) {
    try {
      const response = await this.client.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async changepassword(passwordData,id) {
    try {
      const response = await this.client.patch(`/users/change-password/${id}`, passwordData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      
      throw new Error(error.response.data.message || 'Error from user service');
    } else if (error.request) {
      throw new Error('User service is not responding');
    } else {
      throw new Error('Error setting up request to user service');
    }
  }
}

module.exports = { userservice };
