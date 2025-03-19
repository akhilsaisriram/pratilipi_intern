const RabbitMQService = require("../config/rabbitmq");
const inventory_check = require("../controller/product_controller");
const {Product}=require('../model/product');

const createproductchangemessage = async (changes) => {
  if (changes.length === 0) {
    return "no changes were made to the products in your order.";
  }

  let lines = [];
  for (let c of changes) {
    let p = await Product.findById(c.productid);
    if (p) {
      let action = c.difference > 0 ? "added" : "removed";
      lines.push(`${Math.abs(c.difference)} x ${c.name} ${action}`);
    }
  }

  return `we deleted your order with these product changes:\n` + lines.join('\n');
};


async function processInventoryCheck(queueName, content) {

  try {
    if (queueName === "inventory_check") {
        inventory_check.inventory_check(content);

    }else if(queueName==="update_inventory"){
      try {
        const {data,order}=content;
        for (const change of data) {
          const product = await Product.findById(change.productid);
          if (product) {
            product.unitsavailable = product.unitsavailable + change.difference;
            if (product.unitsavailable < 0) {
              product.inStock = 0; 
            }
            await product.save();
          }
        }
        console.log('product stock updated based on changes.');
        console.log('====================================');
        console.log(data);
        console.log('====================================');
       const mess= await createproductchangemessage(data);
       const type="order_update"
       const id=order.userId;
       console.log('====================================');
       console.log("message",mess);
       console.log('====================================');
       const r={
        content:mess,
        type:type,
        id:id,
        email:order.email
       }
        if(order.orderStatus){
          await RabbitMQService.sendtoqueue("order_update_notification",r)
        }
      } catch (err) {
        console.error('error while updating product stock:', err.message);
      }
    }

  } catch (error) {
    console.error("Error processing inventory check:", error);
  }
}

async function startInventoryConsumer() {

  try {
    console.log("Starting Message Consumers...");

    const queues = ["inventory_check","update_inventory"];
    const channel = await RabbitMQService.connect();

    for (const queue of queues) {
      await channel.assertQueue(queue, { durable: true });

      channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            processInventoryCheck(queue, content);
            channel.ack(msg); 
          }
        },
        { noAck: false }
      );

      console.log(`Listening for messages on ${queue}...`);
    }
  } catch (error) {
    console.error("Error starting consumers:", error);
  }
}

module.exports = startInventoryConsumer;
