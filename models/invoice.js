const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    index: true
  },

  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    index: true
  },

  receivedAddress: {
    type: Schema.Types.ObjectId,
    ref: "Address",
  },

  createdDate: {
    type: Date,
    default: new Date(),
  },

  statuation: {
    type: String,
    enum: ["Đơn hàng đã đặt", "Đã xác nhận thông tin thanh toán", "Đơn hàng đã bị hủy", "Đơn hàng đã nhận", "Đã gia cho ĐVVC", "Đơn hàng đã giao"],
    deafult: "Đơn hàng đã đặt",
    index: true
  },
});

InvoiceSchema.index({shop: 1, statuation: 1});

module.exports = mongoose.model("Invoice", InvoiceSchema);
