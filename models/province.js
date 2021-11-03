const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProvinceSchema = new Schema({
    name: {
        type: String,
        default: ""
    },

    code: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("Province", ProvinceSchema)