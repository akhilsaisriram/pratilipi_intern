const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification-controller'); // Adjust path as needed


router.get('/:userId/:read?', notificationController.getnotifications);



module.exports = router;
