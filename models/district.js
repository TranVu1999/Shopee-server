const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DistrictSchema = new Schema({
    name: {
        type: String,
        default: ""
    },

    code: {
        type: String,
        default: ""
    },
    
    provinceCode: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("District", DistrictSchema)