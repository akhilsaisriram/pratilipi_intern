# Order Microservice

A Node.js-based service for handling orders, integrated with RabbitMQ for messaging and MongoDB for storage.

## What It Does
- Create, fetch, and delete orders.
- Sends inventory check requests via RabbitMQ.
- Listens for inventory confirmations and updates order statuses.
- Periodic (cron) job to auto-update orders from "confirmed" to "shipped" and notify users.

## Key Features
- RabbitMQ integration for inventory updates and notifications.
- Auto-cron job runs every 12 hours to update and notify shipped orders.
- Clean APIs for order management.

## Endpoints
- `GET /order/user/:userId?nondelivered=true/false` – Get orders by user.
- `GET /order/:orderId` – Get order by ID.
- `POST /order` – Create a new order.
- `DELETE /order/:orderId` – Delete an order.

## RabbitMQ Queues Used
- `inventory_check` — Check product availability.
- `inventory_check_queue_from_product_ack` — Receives confirmation from product service.
- `notification_queue` — Sends order status notifications.
- `update_inventory` — Updates product stock after order deletion.


