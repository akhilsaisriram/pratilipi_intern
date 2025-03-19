const express = require('express');
const router = express.Router();
const orderController = require('../controller/order_controller');

router.get('/order/:userId', orderController.getordersbyuser);
router.get('/:orderId', orderController.getorderbyid);
router.post('/', orderController.createorder);
router.delete('/:orderId', orderController.deleteorder);

module.exports = router;
