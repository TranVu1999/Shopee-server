const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    require: true,
  },

  alias: {
    type: String,
    require: true,
  },

  categories: {
    type: Array,
    require: true,
  },

  video: {
    type: String,
    default: "",
  },

  avatar: {
    type: String,
    default: "",
  },

  images: {
    type: Array,
    default: [],
  },

  price: {
    type: Number,
    minimum: 1000,
    default: 1000,
  },

  listPrice: {
    type: Array,
    default: [],
  },

  inventory: {
    type: Number,
    minimum: 50,
    default: 50,
  },

  description: {
    type: String,
    require: true,
    maxLength: 5000,
    minLength: 100,
  },

  classification: {
    type: Object,
    default: null,
  },

  optionalAttributes: {
      type: Object,
      default: null
  },

  unused: {
    type: Boolean,
    default: true,
  },

  sku: {
    type: String,
    default: "",
  },

  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  },

  createdDate: {
      type: Date,
      default: new Date()
  },

  soldNumber: {
      type: Number,
      default: 0
  },

  viewedNumber: {
      type: Number,
      default: 0
  },

  scoreView: {
      type: Number,
      default: 0
  },

  status: {
      type: Boolean,
      default: true
  }
});

module.exports = mongoose.model("Product", ProductSchema);
