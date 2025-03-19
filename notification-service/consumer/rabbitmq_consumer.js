const RabbitMQService = require("../config/rabbitmq");
const create_notification = require("../controller/notification-controller");
const Notification = require("../model/notification"); // Adjust path as needed
const Queue = require("bull");
const nodemailer = require("nodemailer");

const emailQueue = new Queue("emailQueue");
function generateNotification(order) {
  const productDetails = order.products
    .map((p) => `${p.name} (${p.quantity} x ₹${p.price})`)
    .join(", ");

  switch (order.orderStatus) {
    case "pending":
      return `Your order #${order._id
        .toString()
        .slice(-6)} is pending. Items: ${productDetails}. Total: ₹${
        order.totalPrice
      }. We'll notify you once it's confirmed.`;

    case "confirmed":
      return `Your order #${order._id
        .toString()
        .slice(
          -6
        )} has been confirmed! Items: ${productDetails}. Expected delivery by ${new Date(
        order.estimatedDelivery
      ).toLocaleDateString()}. Payment status: ${
        order.isPaid ? "Paid" : "Pending"
      }.`;

    case "shipped":
      return `Great news! Your order #${order._id
        .toString()
        .slice(-6)} containing ${
        order.products.length
      } item(s) (${productDetails}) has been shipped. Expected delivery by ${new Date(
        order.estimatedDelivery
      ).toLocaleDateString()}.`;

    case "delivered":
      return `Your order #${order._id
        .toString()
        .slice(-6)} has been delivered on ${new Date(
        order.deliveryDate
      ).toLocaleDateString()}. We hope you enjoy your ${
        order.products.length > 1 ? "items" : "item"
      }: ${productDetails}.`;

    case "cancelled":
      return `Your order #${order._id
        .toString()
        .slice(-6)} containing ${productDetails} has been cancelled. ${
        order.isPaid
          ? "A refund of ₹" + order.totalPrice + " will be processed shortly."
          : ""
      }`;

    default:
      return `Update on your order #${order._id
        .toString()
        .slice(-6)}: ${productDetails}. Total: ₹${order.totalPrice}.`;
  }
}
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "akhilsaisriram9848@gmail.com",
    pass: "xnbm vsml ulwl sgjj", 
  },
});
async function processnotification_order(notify) {
  const { order, type } = notify;

  const content = generateNotification(order);
  console.log("====================================");
  console.log("from notification", type);
  console.log("====================================");
  const res = create_notification.create_notification(
    content,
    order.userId,
    type
  );

  transporter.sendMail(
    {
      from: "akhilsaisriram9848@gmail.com",
      to: order.email,
      subject: "You order status notification!",
      text: content,
    },
    (error, info) => {
      if (error) {
        console.error("Test Email Error:", error);
      } else {
        console.log("Test Email Sent:", info.response);
      }
    }
  );
}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const generateRecommendation = (product) => {
  if (!product) return "No product data available.";

  return `Looking for something great? Check out ${product.productname} from ${product.company}! 
  This ${product.category} product, under the ${product.subcategory} category, is available for just $${product.price}. 
  With ${product.likes.length} people liking it  it's a trending choice! 
  Hurry, only ${product.unitsavailable} units left in stock. Order now!`;
};
async function processnotificationrecom(contenta) {
  const { data, email,userId } = contenta;
  console.log("====================================");
  console.log("redy to mail");
  console.log("====================================");
  const type="recommendation";
 const content= generateRecommendation(data)
  if (1) {
    await Notification.create({ userId, type, content });

    transporter.sendMail(
      {
        from: "akhilsaisriram9848@gmail.com",
        to: email,
        subject: "You order status notification!",
        text: content,
      },
      (error, info) => {
        if (error) {
          console.error("Test Email Error:", error);
        } else {
          console.log("Test Email Sent:", info.response);
        }
      }
    );
  }
}

async function processnotificationpromotion(notify) {
  const { emails, product,ids } = notify;

  const content = `You have been selected for a promotion on  Check out ${product.productname} from ${product.company}! 
  This ${product.category} product, under the ${product.subcategory} category, is available for just $${product.price}.`;

  const type = "promotion";
  for(const id of ids){
    await Notification.create({ id, type, content });

  }

  for (const email of emails) {
    transporter.sendMail(
      {
        from: "akhilsaisriram9848@gmail.com",
        to: email,
        subject: "Exclusive Promotion!",
        text: content,
      },
      (error, info) => {
        if (error) {
          console.error(`Email Error for ${email}:`, error);
        } else {
          console.log(`Promotion Email Sent to ${email}:`, info.response);
        }
      }
    );
  }
}

async function  order_update_notify(data){
const{content,type,id,email}=data
console.log(content,type,id,email)
await Notification.create({ userId:id, type, content });
transporter.sendMail(
  {
    from: "akhilsaisriram9848@gmail.com",
    to: email,
    subject: "order deleted!",
    text: content,
  },
  (error, info) => {
    if (error) {
      console.error(`Email Error for ${email}:`, error);
    } else {
      console.log(`Promotion Email Sent to ${email}:`, info.response);
    }
  }
);
}

async function startConsumer() {
  try {
    const queues = [
      "notification_queue",
      "promotion_update_ack",
     "recommendation",
     "order_update_notification"
    ];
    const channel = await RabbitMQService.connect();

    for (const queueName of queues) {
      await channel.assertQueue(queueName, { durable: true });

      channel.consume(
        queueName,
        async (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());

             if (queueName === "notification_queue") {
              await processnotification_order(content);
            } else if (queueName === "promotion_update_ack") {
              await processnotificationpromotion(content);
            }
            else if (queueName === "recommendation") {
              await processnotificationrecom(content);
            }
            else if (queueName === "order_update_notification") {
              await order_update_notify(content);
            }

            channel.ack(msg);
          }
        },
        { noAck: false }
      );
    }

    console.log(`Listening for messages on: ${queues.join(", ")}...`);
  } catch (error) {
    console.error("Error starting consumer:", error);
  }
}

module.exports = startConsumer;
