const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema({
    avatar: {
        type: String,
        default: ""
    },

    path: [
        {
            type: Schema.Types.ObjectId,
            ref: "ProductCategory"
        }
    ],

    title:{
        type: String,
        default: "",
    },

    alias: {
        type: String,
        default: ""
    },

    isTop: {
        type: Boolean,
        default: false
    },

    skeletonAttribute: {
        type: Array,
        default: []
    },

    isActive: {
        type: Boolean,
        default: true
    }
});


module.exports = mongoose.model("ProductCategory", ProductCategorySchema)