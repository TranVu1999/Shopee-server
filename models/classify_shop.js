const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassifyShopSchema = new Schema({
    title: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("ClassifyShop", ClassifyShopSchema)