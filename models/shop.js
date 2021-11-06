const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopSchema = new Schema({
    avatar: {
        type: String,
        default: ""
    },

    backgroundImage: {
        type: String,
        default: ""
    },

    brand: {
        type: String,
        default: ""
    },

    alias: {
        type: String,
        default: ""
    },

    images: {
        type: Array,
        default: []
    },

    description: {
        type: String,
        default: ""
    },

    createdDate: {
        type: Date,
        default: Date.now()
    },

    status: {
        type: Boolean,
        default: false
    },

    listTracker: {
        type: Array, 
        default: []
    },

    score: {
        type: Number,
        default: 0
    },

    valuateShop: {
        type: Schema.Types.ObjectId,
        ref: "ClassifyShop"
    },

    account: {
        type: Schema.Types.ObjectId,
        ref: "Account"
    }
});

module.exports = mongoose.model("Shop", ShopSchema)