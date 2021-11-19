const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    index: true,
  },

  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
    index: true,
  },

  message: {
    type: String,
    default: ""
  },

  receivedAddress: {
    type: Schema.Types.ObjectId,
    ref: "Address",
  },

  createdDate: {
    type: Date,
    default: new Date(),
  },
  total: {
    type: Number,
    default: 0,
  },

  statuation: {
    type: String,
    enum: [
      "Đơn hàng đã đặt",
      "Đã xác nhận thông tin thanh toán",
      "Chờ xác nhận",
      "Chuẩn bị hàng",
      "Chờ đóng gói",
      "Chờ lấy hàng",
      "Đã gia đơn vị vận chuyển",
      "Hết hàng",
      "Đang hủy",
      "Trả hàng/Hoàn tiền",
      "Hoàn thành",
    ],
    default: "Đơn hàng đã đặt",
    index: true,
  },
});

InvoiceSchema.index({ shop: 1, statuation: 1 });

module.exports = mongoose.model("Invoice", InvoiceSchema);
