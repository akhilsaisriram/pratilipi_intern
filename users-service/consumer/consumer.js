
const RabbitMQService = require("../config/rabbitmq");
const User = require("../models/user");


async function processpromotionnotification(content) {
  try {
    const users = await User.find({ "preferences.promotions": true });
    if (!users.length) {
      console.log("No users with promotions enabled");
      return false;
    }
    const queueName = "promotion_update_ack";
    const emailList = users.map(user => user.email);
    const ids = users.map(user => user._id);

    const data = {
      emails: emailList,
      ids:ids,
      product:content
    };
    await RabbitMQService.sendtoqueue(queueName, data);
  } catch (error) {
    console.error("Error processing promotion notification:", error);
    return false;
  }
}

async function startConsumer() {
  try {
    const queues = [ "promotion_product_to_users"];
    const channel = await RabbitMQService.connect();

    for (const queueName of queues) {
      await channel.assertQueue(queueName, { durable: true });

      channel.consume(
        queueName,
        (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
          if (queueName === "promotion_product_to_users") {
            processpromotionnotification(content);
            }
           
            channel.ack(msg);
          }
        },
        { noAck: false }
      );
    }
  } catch (error) {
    console.error("Error starting consumer:", error);
  }
}

module.exports = startConsumer;
