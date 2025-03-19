const cron = require('node-cron');
const {Product} = require("../model/product");
const RabbitMQService = require("../config/rabbitmq");

const findtopproduct = async () => {
  try {
    const topLikedProduct = await Product.aggregate([
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likes", []] } }
        }
      },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $limit: 1 }
    ]);

    let data = null;

    if (topLikedProduct.length > 0 && topLikedProduct[0].likesCount > 0) {
      data = topLikedProduct[0];
    } else {
      const newestProduct = await Product.find().sort({ createdAt: -1 }).limit(1);
      data = newestProduct.length > 0 ? newestProduct[0] : null;
    }

    if (data) {
      const qu = "promotion_product_to_users";
      await RabbitMQService.sendtoqueue(qu, data);
    }
  } catch (error) {
    console.error("Error finding top product:", error);
  }
};

  
cron.schedule('0 */12 * * *', async () => {
    console.log("running scheduled job to update orders");
    await findtopproduct();
});

// cron.schedule('*/5 * * * * *', async () => {
//   console.log("running scheduled job to find top product");
//   // await findtopproduct();
// });
