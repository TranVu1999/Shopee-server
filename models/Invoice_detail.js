const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoiceDetailSchema = new Schema({
    invoice: {
        type: Schema.Types.ObjectId,
        ref: "Invoice",
        index: true
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        index: true
    },

    title: {
        type: String,
        default: "",
    },

    alias: {
        type: String,
        default: ""
    },

    price: {
        type: Number,
        default: 1000
    },
    
    image: {
        type: String,
        default: ""
    },

    variant: {
        type: Object,
        default: null
    },

    amount: {
        type: Number,
        default: 1
    },

  
});

module.exports = mongoose.model("InvoiceDetail", InvoiceDetailSchema);
