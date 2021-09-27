const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductCategorySchema = new Schema({
    avatar: {
        type: String,
        default: ""
    },

    title:{
        type: String,
        default: "",
        unique: true,
        index: true
    },

    alias: {
        type: String,
        default: ""
    },

    subCategory: {
        type: Array,
        default: []
    }
});

ProductCategorySchema.index({title: 'text'});
module.exports = mongoose.model("ProductCategory", ProductCategorySchema)