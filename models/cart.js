const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },

    amount: {
        type: Number,
        default: 1
    },

    classification: {
        type: Object,
        default: null
    },
});

CartSchema.index({account: 1, product: 1})
CartSchema.index({account: 1, _id: 1})

module.exports = mongoose.model("Cart", CartSchema)