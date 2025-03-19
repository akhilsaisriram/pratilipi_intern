const express = require("express");
const router = express.Router();
const userController = require("../controller/usercontroller");
router.post("/register", userController.registeruser);
router.post("/login", userController.login);

router.delete('/:id', userController.deleteuser);

router.get('/:id', userController.getuser);

router.put('/:id', userController.updateuser);

router.patch('/change-password/:id', userController.changepassword);

module.exports = router;
