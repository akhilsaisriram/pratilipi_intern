const { Product, SearchHistory, Recommendation } = require("../model/product");
const validatedata = require("./validaror");
const RabbitMQService = require("../config/rabbitmq");

exports.inventory_check = async (message) => {
  const { orderId, order } = message;
  console.log("order inventry check");

  try {
    const productIds = order.products.map((p) => p.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    let isStockAvailable = true;
    let insufficientProducts = [];

    for (const item of order.products) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product || product.unitsavailable < item.quantity) {
        isStockAvailable = false;
        insufficientProducts.push({
          productId: item.productId,
          name: item.name,
        });
      }
    }

    const mess = isStockAvailable ? "ok" : "not ok";
    const messagea = {
      message: mess,
      orderId: order._id,
    };

    if (isStockAvailable) {
      for (const item of order.products) {
        await Product.updateOne(
          { _id: item.productId },
          { $inc: { unitsavailable: -item.quantity } }
        );
      }
    }
    if (order.sendrecommendation) {
      getRecommendedProducts(order.userId, order, order.email);
    }
    await RabbitMQService.sendtoqueue(
      "inventory_check_queue_from_product_ack",
      messagea
    );
  } catch (error) {
    console.error("Error processing inventory check:", error);
  }
};

const getRecommendedProducts = async (userId, recommendationData, email) => {
  try {
    const { products } = recommendationData;

    const uniqueProducts = Array.from(
      new Map(products.map((p) => [p.productId.toString(), p])).values()
    );

    const categories = [...new Set(uniqueProducts.map((p) => p.category))];
    const subcategories = [
      ...new Set(uniqueProducts.map((p) => p.subcategory)),
    ];
    const companies = [...new Set(uniqueProducts.map((p) => p.company))];
    const productNames = [...new Set(uniqueProducts.map((p) => p.name))];
    const productIds = uniqueProducts.map((p) => p.productId);
    await SearchHistory.findOneAndUpdate(
      { userId },
      {
        $addToSet: {
          query: { $each: productNames || [] },
          category: { $each: categories || [] },
          subcategory: { $each: subcategories || [] },
          company: { $each: companies || [] },
        },
        $currentDate: { updatedAt: true },
      },
      { upsert: true, new: true }
    );

    const searchHistory = await SearchHistory.findOne({ userId });

    if (!searchHistory) {
      return [];
    }

    const { query, category, subcategory, company } = searchHistory;

    const searchQuery = {
      $or: [
        { category: { $in: category || [] } },
        { subcategory: { $in: subcategory || [] } },
        { company: { $in: company || [] } },

        ...(query || []).map((name) => ({
          productname: { $regex: new RegExp(name, "i") },
        })),
      ],
    };

    const recommendedProducts = await Product.find(searchQuery)
      .sort({ likes: -1, price: 1 }) 
      .limit(4);

    const recommendationsToAdd = recommendedProducts.map((prod) => ({
      productId: prod._id,
    }));

    for (const prod of recommendedProducts) {
      const data = {
        data: prod,
        userId: userId,
        email: email,
      };
      await RabbitMQService.sendtoqueue("recommendation", data);
    }
    await Recommendation.findOneAndUpdate(
      { userId },
      {
        $push: {
          recommendations: { $each: recommendationsToAdd, $position: 0 },
        },
      },
      { upsert: true, new: true }
    );

    return recommendedProducts;
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    throw error;
  }
};

exports.addproduct = async (req, res) => {
  console.log("data product", req.body);

  const { isValid, errors } = validatedata.validatedata(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const existingProduct = await Product.findOne({
      productname: req.body.productname,
      userId: req.body.userId,
      company: req.body.company,
    });

    if (existingProduct) {
      console.log("====================================");
      console.log("Product already exists for this user and company.");
      console.log("====================================");
      return res.status(400).json({
        message: "Product already exists for this user and company.",
      });
    }
    const productData = {
      userId: req.body.userId,
      productname: req.body.productname,
      description: req.body.description,
      price: req.body.price,
      unitsavailable: req.body.unitsavailable,
      category: req.body.category,
      subcategory: req.body.subcategory,
      company: req.body.company,

      images: req.body.images || [],
    };

    const newProduct = await Product.create(productData);
    res
      .status(201)
      .json({ message: "sucessfully added product", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  console.log(page, limit);

  try {
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      products,
    });
  } catch (error) {
    console.log("====================================");
    console.log(error.message);
    console.log("====================================");
    res.status(500).json({ message: error.message });
  }
};
exports.searchProducts = async (req, res) => {
  try {
    const {
      userId,
      query,
      category,
      subcategory,
      company,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.body.data;

    console.log("data", userId, query, company);

    const allowedSortFields = ["createdAt", "updatedAt"];
    const allowedOrderValues = ["asc", "desc"];

    const validatedSort = allowedSortFields.includes(sort) ? sort : "createdAt";
    const validatedOrder = allowedOrderValues.includes(order) ? order : "desc";

    const searchCriteria = {};
    if (query) {
      console.log("hiii");
      searchCriteria["$or"] = [
        { productname: { $regex: query, $options: "i" } },
      ];
    }
    console.log("entry");
    console.log(searchCriteria);
    console.log("exit");

    if (category) {
      searchCriteria.category = { $regex: category, $options: "i" };
    }

    if (subcategory) {
      searchCriteria.subcategory = { $regex: subcategory, $options: "i" };
    }

    if (company) {
      searchCriteria.company = { $regex: company, $options: "i" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      searchCriteria.price = {};
      if (minPrice !== undefined) {
        searchCriteria.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        searchCriteria.price.$lte = Number(maxPrice);
      }
    }

    searchCriteria.unitsavailable = { $gt: 0 };

    const skip = (Number(page) - 1) * Number(limit);
    const sortOption = {};
    sortOption[validatedSort] = validatedOrder === "asc" ? 1 : -1;

    const totalProducts = await Product.countDocuments(searchCriteria);

    const products = await Product.find(searchCriteria)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    await SearchHistory.findOneAndUpdate(
      { userId },
      {
        $addToSet: {
          query: query ? query : undefined,
          category: category ? category : undefined,
          subcategory: subcategory ? subcategory : undefined,
          company: company ? company : undefined,
        },
        $currentDate: { updatedAt: true },
      },
      { upsert: true, new: true }
    );

    console.log(products);

    res.status(200).json({ data: products });
  } catch (error) {
    console.log("Search products error:", error);
    return res.status(500).json({
      message: "Error searching products",
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updateFields = {};

    if (product.name) updateFields.query = [product.name];
    if (product.category) updateFields.category = [product.category];
    if (product.subcategory) updateFields.subcategory = [product.subcategory];
    if (product.company) updateFields.company = [product.company];

    await SearchHistory.findOneAndUpdate(
      { userId },
      {
        $addToSet: {
          query: { $each: updateFields.query || [] },
          category: { $each: updateFields.category || [] },
          subcategory: { $each: updateFields.subcategory || [] },
          company: { $each: updateFields.company || [] },
        },
        $currentDate: { updatedAt: true },
      },
      { upsert: true, new: true }
    );


    const searchHistory = await SearchHistory.findOne({ userId });

    if (!searchHistory) {
      res.status(200).json({ data: product });
    }

    const { query, category, subcategory, company } = searchHistory;

    const searchQuery = {
      $or: [
        { category: { $in: category || [] } },
        { subcategory: { $in: subcategory || [] } },
        { company: { $in: company || [] } },

        ...(query || []).map((name) => ({
          productname: { $regex: new RegExp(name, "i") },
        })),
      ],
    };

    const recommendedProducts = await Product.find(searchQuery)
      .sort({ likes: -1, price: 1 }) // You can sort by likes or price or both
      .limit(4);

    const recommendationsToAdd = recommendedProducts.map((prod) => ({
      productId: prod._id,
    }));

    await Recommendation.findOneAndUpdate(
      { userId },
      {
        $push: {
          recommendations: { $each: recommendationsToAdd, $position: 0 },
        },
      },
      { upsert: true, new: true }
    );
    res.status(200).json({ data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateproduct = async (req, res) => {
  const productId = req.params.id;

  const { isValid, errors } = validatedata.validatedata(req.body, true);

  if (!isValid) {
    console.log(errors);

    return res.status(400).json({ errors });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addreview = async (req, res) => {
  const { productId } = req.params;
  const { username, userId, message } = req.body;
  console.log(username, userId, message);
  if (!username || !userId || !message) {
    return res.status(400).json({
      message: "username, userid, and message are required.",
    });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    const newReview = {
      username,
      userId,
      message,
      createdAt: new Date(),
    };

    product.reviews.push(newReview);

    await product.save();

    return res.status(201).json({
      message: "Review added successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updaterating = async (req, res) => {
  try {
    const { productId, userId } = req.params;
    const { action } = req.body;

    if (!productId || !userId || !action) {
      return res
        .status(400)
        .json({ message: "Product ID, User ID, and action are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const userObjectId = userId;

    if (action === "like") {
      if (!product.likes.includes(userObjectId)) {
        product.likes.push(userObjectId);
        product.dislikes = product.dislikes.filter(
          (id) => id.toString() !== userObjectId
        );
      }
    } else if (action === "dislike") {
      if (!product.dislikes.includes(userObjectId)) {
        product.dislikes.push(userObjectId);
        product.likes = product.likes.filter(
          (id) => id.toString() !== userObjectId
        );
      }
    } else {
      return res
        .status(400)
        .json({ message: 'Invalid action. Use "like" or "dislike".' });
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delproduct = async (req, res) => {
  const { id, userId } = req.params;
  console.log("====================================");
  console.log(id, userId);
  console.log("====================================");
  try {
    const deleted = await Product.findOneAndDelete({ _id: id, userId: userId });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "product not found or user not allowed" });
    }
    return res.status(200).json({ message: "product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "something went wrong", error: err.message });
  }
};

exports.getUserRecommendations = async (req, res) => {
  try {
    const { userId } = req.body;

    console.log("reco", userId);
    const userRecommendation = await Recommendation.findOne({ userId:userId });

    if (!userRecommendation || !userRecommendation.recommendations.length) {
      return res.status(200).json({
        data: [],
      });
    }

    const productIds = userRecommendation.recommendations.map(
      (rec) => rec.productId
    );

    const recommendedProducts = await Product.find({
      _id: { $in: productIds },
    });

    const sortedProducts = productIds
      .map((id) =>
        recommendedProducts.find(
          (product) => product._id.toString() === id.toString()
        )
      )
      .filter(Boolean);

    return res.status(200).json({
      data:sortedProducts,
    });
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user recommendations",
      error: error.message,
    });
  }
};
