// const express = require("express");
// const { ApolloServer } = require("@apollo/server");
// const { expressMiddleware } = require("@apollo/server/express4");
// const { makeExecutableSchema } = require("@graphql-tools/schema");
// const morgan = require("morgan");
// const cors = require("cors");
// const http = require("http");
// const jwt = require("jsonwebtoken");
// const {
//   ApolloServerPluginDrainHttpServer,
// } = require("@apollo/server/plugin/drainHttpServer");
// const { GraphQLError } = require("graphql");
// const JWT_SECRET  = "abcd";
// const extractToken = (tokenString) => {
//   try {
//     if (!tokenString) throw new Error("No token provided");

//     const parts = tokenString.split(" ");
//     if (parts.length !== 2 || parts[0] !== "Bearer") {
//       throw new Error("Invalid token format");
//     }

//     return parts[1];
//   } catch (error) {
//     console.error("Token extraction failed:", error.message);
//     return null;
//   }
// };

// const verifyToken = (bearerString) => {
//   try {
//     console.log("====================================");
//     console.log(bearerString);
//     console.log("base",process.env.BASE_URL);

//     console.log("====================================");
//     const token = extractToken(bearerString);
//     if (!token) throw new Error("Token extraction failed");

//     const decoded = jwt.verify(token, JWT_SECRET);
//     return decoded;
//   } catch (error) {
//     console.error("Token verification failed:", error.message);
//     return null;
//   }
// };

// const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
// const {
//   typeDefs: userTypeDefs,
//   resolvers: userResolvers,
// } = require("./schema/schema_user");
// const {
//   typeDefs: orderTypeDefs,
//   resolvers: orderResolvers,
// } = require("./schema/order_schema");
// const {
//   typeDefs: productTypeDefs,
//   resolvers: productResolvers,
// } = require("./schema/product_schema");
// const {
//   typeDefs: notificationTypeDefs,
//   resolvers: notificationResolvers,
// } = require("./schema/notification_schema");

// const typeDefs = mergeTypeDefs([
//   userTypeDefs,
//   orderTypeDefs,
//   productTypeDefs,
//   notificationTypeDefs,
// ]);
// const resolvers = mergeResolvers([
//   userResolvers,
//   orderResolvers,
//   productResolvers,
//   notificationResolvers,
// ]);

// async function startServer() {
//   const app = express();
//   const httpServer = http.createServer(app);

//   const schema = makeExecutableSchema({
//     typeDefs,
//     resolvers,
//   });

//   const server = new ApolloServer({
//     schema,
//     introspection: true,
//     plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
//     formatError: (error) => {
//       if (error.extensions.code === "UNAUTHENTICATED") {
//         return {
//           message: error.message,
//           code: error.extensions.code,
//           status: 401,
//         };
//       }
//       return error;
//     },
//   });

//   await server.start();

//   app.use(
//     "/graphql",
//     cors(),
//     express.json(),
//     morgan("dev"),
//     expressMiddleware(server, {
//       context: async ({ req }) => {
//         const publicOperations = ["Register", "login", ""];

//         const operationName = req.body.operationName || "";
//         const query = req.body.query || "";

//         const isPublicOperation = publicOperations.some(
//           (op) => operationName.includes(op) || query.includes(op)
//         );

//         console.log("Operation:", operationName, "Public:", isPublicOperation);

//         if (1) {
//           const token = req.headers.authorization;
//           console.log("Received Token:", token);

//           if (!token) {
//             throw new GraphQLError("Authentication token is required", {
//               extensions: {
//                 code: "UNAUTHENTICATED",
//                 http: { status: 401 },
//               },
//             });
//           }

//           const user = verifyToken(token);
//           console.log("Decoded User:", user);

//           if (!user) {
//             throw new GraphQLError("Invalid or expired token", {
//               extensions: {
//                 code: "UNAUTHENTICATED",
//                 http: { status: 401 },
//               },
//             });
//           }

//           return { userId: user.id };
//         }

//         return { userId: null };
//       },
//     })
//   );

//   app.get("/", (req, res) => {
//     res.status(200).json({ message: " API Gateway is running" });
//   });

//   const PORT = process.env.PORT || 8080;
//   await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
//   console.log(
//     `API Gateway running on port ${PORT}, GraphQL  at http://localhost:${PORT}/graphql`
//   );
// }

// startServer().catch((err) => console.error("Error starting server:", err));
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const morgan = require("morgan");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { GraphQLError } = require("graphql");
const JWT_SECRET  = "abcd";
const extractToken = (tokenString) => {
  try {
    if (!tokenString) throw new Error("No token provided");

    const parts = tokenString.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("Invalid token format");
    }

    return parts[1];
  } catch (error) {
    console.error("Token extraction failed:", error.message);
    return null;
  }
};

const verifyToken = (bearerString) => {
  try {
    console.log("====================================");
    console.log(bearerString);
    console.log("base",process.env.BASE_URL);

    console.log("====================================");
    const token = extractToken(bearerString);
    if (!token) throw new Error("Token extraction failed");

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};

const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const {
  typeDefs: userTypeDefs,
  resolvers: userResolvers,
} = require("./schema/schema_user");
const {
  typeDefs: orderTypeDefs,
  resolvers: orderResolvers,
} = require("./schema/order_schema");
const {
  typeDefs: productTypeDefs,
  resolvers: productResolvers,
} = require("./schema/product_schema");
const {
  typeDefs: notificationTypeDefs,
  resolvers: notificationResolvers,
} = require("./schema/notification_schema");

const typeDefs = mergeTypeDefs([
  userTypeDefs,
  orderTypeDefs,
  productTypeDefs,
  notificationTypeDefs,
]);
const resolvers = mergeResolvers([
  userResolvers,
  orderResolvers,
  productResolvers,
  notificationResolvers,
]);

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: (error) => {
      if (error.extensions.code === "UNAUTHENTICATED") {
        return {
          message: error.message,
          code: error.extensions.code,
          status: 401,
        };
      }
      return error;
    },
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    morgan("dev"),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const publicOperations = ["Register", "login"];
      
        const query = req.body.query || "";
        const operationIsPublic = publicOperations.some((op) => query.includes(op));
        
        if (operationIsPublic) {
          return { userId: null };
        }
      
        const token = req.headers.authorization;
        console.log("Received Token:", token);
      
        if (!token) {
          throw new GraphQLError("Authentication token is required", {
            extensions: {
              code: "UNAUTHENTICATED",
              http: { status: 401 },
            },
          });
        }
      
        const user = verifyToken(token);
        console.log("Decoded User:", user);
      
        if (!user) {
          throw new GraphQLError("Invalid or expired token", {
            extensions: {
              code: "UNAUTHENTICATED",
              http: { status: 401 },
            },
          });
        }
      
        return { userId: user.id };
      }
      
    })
  );

  app.get("/", (req, res) => {
    res.status(200).json({ message: " API Gateway is running" });
  });

  const PORT = process.env.PORT || 8080;
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(
    `API Gateway running on port ${PORT}, GraphQL  at http://localhost:${PORT}/graphql`
  );
}

startServer().catch((err) => console.error("Error starting server:", err));
