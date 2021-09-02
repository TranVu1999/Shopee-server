const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliverAddressSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    address: {
        type: Object,
        required: true
    },

    default: {
        type: Boolean
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

module.exports = mongoose.model("DeliverAddress", UserSchema)