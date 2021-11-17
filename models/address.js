const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    fullname: {
        type: String,
        default: ""
    },

    phoneNumber: {
        type: String,
        default: ""
    },

    houseNumber: {
        type: String,
        default: ""
    },

    ward: {
        type: String,
        default: ""
    },

    district: {
        type: String,
        default: ""
    },

    province: {
        type: String,
        default: ""
    },
       
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },

    isDefault: {
        type: Boolean,
        default: false
    },

    isDeliveryAddress: {
        type: Boolean,
        default: false
    },

    isReceivedAddress: {
        type: Boolean,
        default: false
    }
});

AddressSchema.index({_id: 1, account: 1}); // schema level

module.exports = mongoose.model("Address", AddressSchema)