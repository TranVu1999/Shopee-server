const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSaveChangeSchema = new Schema({
  title: {
    type: String,
    default: ""
  },

  price: {
    type: Number,
    default: 0,
  },

  listPrice: {
    type: Array,
    default: [],
  },

  classification: {
    type: Object,
    default: null,
  },

  modifiedDate: {
      type: Date,
      default: new Date()
  },

  modifiedBy: {
    type: Schema.Types.ObjectId,
    ref: "Account",
  }
});

module.exports = mongoose.model("ProductSaveChange", ProductSaveChangeSchema);
