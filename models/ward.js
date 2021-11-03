const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WardSchema = new Schema({
    name: {
        type: String,
        default: ""
    },

    code: {
        type: String,
        default: ""
    },
    
    districtCode: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model("Ward", WardSchema)