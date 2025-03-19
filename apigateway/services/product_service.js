const axios = require("axios");
const { BASE_URL } = process.env;

class ProductService {
  constructor(token = null) {
    console.log('====================================');
    console.log(token);
    console.log('====================================');
    this.client = axios.create({
      baseURL: `${BASE_URL}:3003`,
      headers: token ? { Authorization: token } : {}
    });
   }

  async addProduct(productData,userId) {
    productData.userId = userId;

    const data=await this.sendRequest("post", "/product/add", productData);
    console.log(data.message);
    
    return data.product;
  }

  async getAllProducts(page, limit) {
    console.log(page,limit);
    
    const data= await this.sendRequest("get", "/product/all", { params: { page, limit } });
  
    return data;
  }

  async searchProducts(data,userid) {
    console.log(userid);
    
    data.userId = userid;
    const res=await this.sendRequest("post", "/product/search", { data });
    return res.data;
  }

  async getProductById(id, userId) {
    const res=await this.sendRequest("get", `/product/${id}/${userId}`);
    return res.data;
  }
  async delproduct(id, userId) {
    const res=await this.sendRequest("get", `/product/del/${id}/${userId}`);
    console.log('====================================');
    console.log("mes", res);
    console.log('====================================');
    return res.message;
  }

  async updateProduct(id, productData) {
    const data=await this.sendRequest("put", `/product/update/${id}`, productData);
    return data.product;
  }

  async addReview(productId, reviewData) {
    return this.sendRequest("post", `/product/review/${productId}`, reviewData);
  }

  async updateRating(productId, userId, action) {
    return this.sendRequest("post", `/product/rate/${productId}/${userId}`, { action });
  }

  async getRecommendations(userId) {
    const res=await this.sendRequest("post", `/product/recommandation`,{userId});
    // console.log(res)
    return res.data;
    
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
      throw new Error(error.response.data.message || "Error from product service");
    } else if (error.request) {
      throw new Error("Product service is not responding");
    } else {
      throw new Error("Error setting up request to product service");
    }
  }
}

module.exports = {ProductService};
