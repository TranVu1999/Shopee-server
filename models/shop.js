const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
    brandName: {
        type: String,
        required: true
    },

    alias: {
        type: String,
        required: true
    },

    createdDate: {
        type: Date,
        required: true
    },

    status: {
        type: Boolean,
        default: true
    },

    listTracker: [
        {
            type: Schema.Types.ObjectId,
            ref: "Account"
        }
    ],

    valuateShop: {
        type: Schema.Types.ObjectId,
        ref: "ClassifyShop"
    }
});

module.exports = mongoose.model("Shop", ShopSchema)