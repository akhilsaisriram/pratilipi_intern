const { gql } = require('graphql-tag');
const { userservice } = require('../services/user_service');

const typeDefs = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    preferences: Preferences
    createdAt: String
    updatedAt: String
  }

  type Preferences {
    promotions: Boolean
    order_updates: Boolean
    recommendations: Boolean
  }

  input PreferencesInput {
    promotions: Boolean
    order_updates: Boolean
    recommendations: Boolean
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    preferences: PreferencesInput
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    preferences: PreferencesInput
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  type AuthResponse {
    user: User!
    token: String!
  }

  type Query {
    getUser: User
  }

  type Mutation {
    register(input: RegisterInput!): User!
    login(input: LoginInput!): AuthResponse!
    updateUser(input: UpdateUserInput!): User!
    deleteUser: Message!
    changePassword(input: ChangePasswordInput!): Message!
  }

  type Message {
    message: String!
  }
`;

const resolvers = {
  Query: {
    getUser: async (_, __, { userId }) => {
      const userService = new userservice();
      const response = await userService.getuser(userId);
      return response.data;
    }
  },
  Mutation: {
    register: async (_, { input }) => {
      const userService = new userservice();
      const response = await userService.register(input);
      return response;
    },
    login: async (_, { input }) => {
      const userService = new userservice();
      return await userService.login(input);
    },
    updateUser: async (_, { input }, { userId }) => {
      const userService = new userservice();
      const response = await userService.updateuser(input,userId);
      return response.data;
    },
    deleteUser: async (_, __, { userId }) => {
      const userService = new userservice();
      return await userService.deleteuser(userId);
    },
    changePassword: async (_, { input }, { userId }) => {
      const userService = new userservice();
      return await userService.changepassword(input,userId);
    }
    
  }
};

module.exports = { typeDefs, resolvers };
