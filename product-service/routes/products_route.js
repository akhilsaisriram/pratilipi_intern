const express = require('express');
const router = express.Router();
const productController = require('../controller/product_controller');
router.post('/add', productController.addproduct);

router.get('/all', productController.getAllProducts);

router.post('/search', productController.searchProducts);
router.put('/update/:id', productController.updateproduct);
router.post('/review/:productId', productController.addreview);
router.post('/rate/:productId/:userId', productController.updaterating);
router.get('/:id/:userId', productController.getProductById);
router.get('/del/:id/:userId', productController.delproduct);


router.post('/recommandation', productController.getUserRecommendations);

module.exports = router;
