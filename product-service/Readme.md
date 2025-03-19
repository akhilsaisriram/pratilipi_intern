# Product Microservice

A Node.js-based service for handling Products, integrated with RabbitMQ for messaging and order servise commnication and MongoDB for storage.

## What It Does
-Product Management: Create, update, and retrieve product details.
-Inventory Check: Validate stock availability before processing requests.
-RabbitMQ Integration: Listens for messages related to products and processes them.
-Recommendations: Fetches and provides product recommendations based on certain criteria.

## Key Features
- RabbitMQ integration for inventory updates and notifications.
- Auto-cron job runs every 12 hours to update and notify Promotional updates.
- Clean APIs for order management.

## Endpoints
- `POST /product` — Create product  
- `GET /product/:id` — Get product  
- `PUT /product/:id` — Update product  
- `DELETE /product/:id` — Delete product 
- `GET /recommendations` — Product suggestions  


## RabbitMQ Queues Used
- `recommendation` —  Queue for  product  recommendation to notification
- `inventory_check_queue_from_product_ack` —  Queue for receiving product update acknowledgments 
- `update_inventory` — stock update requests
- `inventory_check` — Stock  availability checks 
- `promotion_product_to_users` -sending product promotions to users


