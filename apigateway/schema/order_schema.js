const { gql } = require('graphql-tag');
const {  OrderService} = require('../services/order_service');
const { GraphQLDateTime } = require('graphql-scalars');

const typeDefs = gql`
  scalar Date

  type Order {
    _id: ID!
    userId: ID!
    products: [OrderProduct!]!
    totalPrice: Float!
    address: String!
    contactNumber: String!
    orderDate: String!
    estimatedDelivery: String!
    isDelivered: Boolean!
    deliveryDate: String
    paymentMethod: String!
    isPaid: Boolean!
    transactionId: String
    orderStatus: String!
  }

  type OrderProduct {
    productId: ID!
    name: String!
    company: String!
    quantity: Int!
    price: Float!
    category: String!
    subcategory: String!
  }

  input OrderProductInput {
    productId: ID!
    name: String!
    company: String!
    quantity: Int!
    price: Float!
    category: String!
    subcategory: String!
  }

input CreateOrderInput {
  name: String!
  email: String!
  products: [OrderProductInput!]!
  address: String!
  contactNumber: String!
  orderDate: Date!
  estimatedDelivery: String
  isDelivered: Boolean
  deliveryDate: Date
  paymentMethod: String!
  isPaid: Boolean
  sendnotification: Boolean
  sendrecommendation: Boolean
  paymentTime: String
  transactionId: String
  orderStatus: String!
}




  type Message {
    message: String!
  }

  type Query {
    getOrdersByUser(nondelivered:Boolean = false): [Order!]!
    getOrderById(orderId: ID!): Order
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Message!
    deleteOrder(orderId: ID!): Message!
  }
`;

const resolvers = {
  Date: GraphQLDateTime,

  Query: {
    getOrdersByUser: async (_, {nondelivered},context) => {
      const userId=context.userId;
      const orderService = new OrderService();
      return await orderService.getOrdersByUser(userId,nondelivered);
    },
    getOrderById: async (_, { orderId }) => {
      const orderService = new OrderService();
      const data= await orderService.getOrderById(orderId);
      return data.data;
    }
  },
  Mutation: {
    createOrder: async (_, { input },{userId}) => {
      console.log(userId);
      
      input.userId=userId;
      
      const orderService = new OrderService();

      const data= await orderService.createOrder(input);
    console.log(input)
      return data;
    },

    deleteOrder: async (_, { orderId }) => {
      const orderService = new OrderService();
      return await orderService.deleteOrder(orderId);
    }
  }
};

module.exports = { typeDefs, resolvers };
