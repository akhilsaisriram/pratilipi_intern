const { gql } = require('graphql-tag');
const { NotificationService } = require('../services/notification_service');

const typeDefs = gql`
  type Notification {
    _id: ID!
    userId: ID!
    type: String!
    content: String!
    sentAt: String!
    read: Boolean!
  }

  type Query {
    getUnreadNotifications(read: Boolean = false): [Notification!]!
  }

`;

const resolvers = {
  Query: {
    getUnreadNotifications: async (_, { read},context) => {
      const userId = context.userId;
      console.log(context);
      const notificationService = new NotificationService();
      return await notificationService.getunreadnotifications(userId,read);
    }
  },

};

module.exports = { typeDefs, resolvers };
