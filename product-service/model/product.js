
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    productname: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    dislikes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    unitsavailable: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    query: [{ type: String }],
    category: [{ type: String }],
    subcategory: [{ type: String }],
    company: [{ type: String }],
  },
  { timestamps: true }
);

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    recommendations: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

recommendationSchema.pre('save', function (next) {
  console.log('====================================');
  console.log("save");
  console.log('====================================');
  const uniqueMap = new Map();
  this.recommendations.forEach(rec => {
    uniqueMap.set(rec.productId.toString(), rec);
  });
  this.recommendations = Array.from(uniqueMap.values());

  if (this.recommendations.length > 7) {
    this.recommendations.sort((a, b) => a.addedAt - b.addedAt);
    this.recommendations = this.recommendations.slice(-7);
  }

  next();
});



const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);
const Product = mongoose.model("Product", productSchema);
const Recommendation = mongoose.model("Recommendation", recommendationSchema);

module.exports = {
  Product,
  SearchHistory,
  Recommendation
};
