# Notification Microservice

This is a simple Node.js microservice that listens to RabbitMQ queues and sends notifications to users — both by email and by saving them in the database. It handles order updates, promotions, recommendations

## What it does
- Listens to RabbitMQ for different types of notifications.
- Sends emails using Nodemailer (via Gmail SMTP).
- Saves all notifications in MongoDB so users can view them later.
- Provides an API to get notifications and mark them as read.

## Queues it listens to
- `notification_queue` — Order status updates  
- `promotion_update_ack` — Promotions and special offers  
- `recommendation` — Product recommendations just for you  
- `order_update_notification` — Order updates or deletions  

## API
- `GET /notification/:userId/:read` — Get notifications for a user.  
  - If `read=true`, it will also mark those notifications as read.  

---

