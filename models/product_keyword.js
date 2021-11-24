const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductKeywordSchema = new Schema({
    keyword: {
        type: String,
        index: true
    },

    scoreView: {
        type: Number,
        default: 0
    },

    listProduct: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }],    
});


module.exports = mongoose.model("ProductKeyword", ProductKeywordSchema)