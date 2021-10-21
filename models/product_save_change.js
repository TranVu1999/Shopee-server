const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSaveChangeSchema = new Schema({
  title: {
    type: String,
    default: ""
  },

  alias: {
    type: String,
    require: true,
  },

  categories: {
    type: Array,
    default: [],
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
    default: 0,
  },

  listPrice: {
    type: Array,
    default: [],
  },

  promotion: {
    type: Number,
    default: 0,
  },

  inventory: {
    type: Number,
    default: 0,
  },

  description: {
    type: String,
    default: "",
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
    default: null,
  },

  sku: {
    type: String,
    default: "",
  },

  modifiedDate: {
      type: Date,
      default: new Date()
  },
});

module.exports = mongoose.model("ProductSaveChange", ProductSaveChangeSchema);
