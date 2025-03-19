const { gql } = require("graphql-tag");
const { ProductService } = require("../services/product_service");

const typeDefs = gql`
  type Product {
    _id: ID!
    productname: String!
    description: String!
    price: Float!
    unitsavailable: Int!
    category: String!
    subcategory: String!
    company: String!
    images: [String]
    likes: [ID]
    dislikes: [ID]
    reviews: [Review]
    createdAt: String
    updatedAt: String
  }
  input Searchproductinput {
    query: String
    category: String
    subcategory: String
    company: String
    minPrice: Float
    maxPrice: Float
    sort: String
    order: String
    page: Int
    limit: Int
  }

  type Review {
    username: String!
    userid: ID!
    message: String!
    createdAt: String
  }

  input AddProductInput {
    productname: String!
    description: String!
    price: Float!
    unitsavailable: Int!
    category: String!
    subcategory: String!
    company: String!
    images: [String]
  }

  input UpdateProductInput {
    productname: String
    description: String
    price: Float
    unitsavailable: Int
    category: String
    subcategory: String
    company: String
    images: [String]
  }

  input AddReviewInput {
    username: String!
    message: String!
  }

  type Query {
    getProduct(id: ID!): Product
    getAllProducts(page: Int, limit: Int): [Product]
    searchProducts(input: Searchproductinput!): [Product]
    getUserRecommendations: [Product]
  }
  enum RatingChoice {
    like
    dislike
  }
  type Mutation {
    addProduct(input: AddProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): String!
    addReview(productId: ID!, input: AddReviewInput!): String!
    updateRating(productId: ID!, rating: RatingChoice!): Product!
  }
`;

const resolvers = {
  Query: {
    getProduct: async (_, { id }, context) => {
      const userId = context.userId;
      // console.log(context);
      const productService = new ProductService();
      return await productService.getProductById(id, userId);
    },
    getAllProducts: async (_, { page, limit }) => {
      const productService = new ProductService();
      const data = await productService.getAllProducts(page, limit);
      return data.products;
    },
    searchProducts: async (_, { input }, context) => {
      const userId = context.userId;
      // console.log(context);

      const productService = new ProductService();
      return await productService.searchProducts(input, userId);
    },
    getUserRecommendations: async (_, {}, context) => {
      const userId = context.userId;
 
      const productService = new ProductService();
      const result = await productService.getRecommendations(userId);

      return result;
    },
    
  },
  Mutation: {
    addProduct: async (_, { input }, { userId }) => {
      const productService = new ProductService();
      return await productService.addProduct(input, userId);
    },
    updateProduct: async (_, { id, input }) => {
      const productService = new ProductService();
      return await productService.updateProduct(id, input);
    },
    deleteProduct: async (_, { id }, { userId }) => {
      const productService = new ProductService();
      return await productService.delproduct(id, userId);
    },
    addReview: async (_, { productId, input }, { userId }) => {
      input.userId = userId;
      const productService = new ProductService();
      const res = await productService.addReview(productId, input);
      return res.message;
    },
    updateRating: async (_, { productId, rating }, { userId }) => {
      const productService = new ProductService();
      return await productService.updateRating(productId, userId, rating);
    },
  },
};

module.exports = { typeDefs, resolvers };
