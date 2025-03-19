const Order = require("../model/order");
const order_validator = require("./validator");
const RabbitMQService = require("../config/rabbitmq"); 
exports.getordersbyuser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { nondelivered } = req.query;
    console.log("order a", userId, nondelivered);
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    let query = { userId };
    if (nondelivered === "true") {
      query.isDelivered = false;
    } else {
      query.isDelivered = true;
    }
    const orders = await Order.find(query).sort({ orderDate: -1 });

    res.status(200).json({ data: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getorderbyid = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createorder = async (req, res) => {
  try {
    const orderData = req.body;

    const productIds = orderData.products.map((p) => p.productId);

    const existingOrder = await Order.findOne({
      userId: orderData.userId,
      address: orderData.address,
      paymentMethod: orderData.paymentMethod,
      isPaid: orderData.isPaid,
      "products.productId": { $all: productIds },
      totalPrice: orderData.totalPrice,
      orderDate: orderData.orderDate,
      estimatedDelivery: orderData.estimatedDelivery,
    });

    if (existingOrder) {
      return res
        .status(400)
        .json({ message: "Duplicate order. This order already exists." });
    }

    const order = new Order(orderData);
    order.totalPrice = order.calculateTotalPrice();

    const errors = order_validator.validator(order);

    if (errors.length > 0) {
      console.log('====================================');
      console.log(errors);
      console.log('====================================');
      return res.status(400).json({ message: errors });
    }

    await order.save();

    const messagea = {
      orderId: order._id,
      order: order,
    };
    // console.log('====================================');
    // console.log(messagea);
    // console.log('====================================');
    await RabbitMQService.sendtoqueue("inventory_check", messagea);

    res.status(201).json({
      order: order,
      message: "Order received. We will notify you about the status via email.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteorder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "order ID is required" });
    }
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const product_changes = order.products.map((item) => ({
      productid: item.productId,
      difference: -item.quantity,
      name: item.name,
    }));
    const re = {
      data: product_changes,
      order: order,
    };

    await Order.deleteOne({ _id: orderId });

    await RabbitMQService.sendtoqueue("update_inventory", re);

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
