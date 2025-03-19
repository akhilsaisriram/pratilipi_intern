# User Microservice

A Node.js-based service for handling user registration, authentication, profile management, and promotion notifications. Integrated with RabbitMQ for messaging and MongoDB for storage.

## What It Does
- User Registration & Login: Create accounts, login, and receive JWT tokens.
- Profile Management: Get, update, and delete user profiles.
- Password Management: Change passwords securely.
- Promotion Notifications: Sends promotional emails to users with preferences enabled via RabbitMQ.

## Key Features
- RabbitMQ integration for sending promotion updates.
- Validations for email, password, and user preferences.
- JWT-based authentication system.
- MongoDB for storing user data.

## Endpoints
- `POST  /users/register ` — Register a new user
- `POST /users/login` — Login and receive JWT token
- `GET /users/:id ` — Get user details by ID
- `PUT /users/:id` —  Update user information
- `DELETE /users/:id` —  Delete a user
- `PATCH /users/change-password/:id`— Change user password


## RabbitMQ Queues Used
- `promotion_product_to_users` —  Listens for product promotions and sends notifications to users
- `promotion_update_ack` —  Sends acknowledgment with user emails and IDs to notification service after sending promotions



