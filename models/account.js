const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    email: {
        type: String,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    listTracker: [{
        type: Schema.Types.ObjectId,
        ref: "Shop"
    }],

    invoices: {
        type: Array
    },

    reports: {
        type: Array
    },
    
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },

    shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    
    socialToken: {
        type: String
    }
});

module.exports = mongoose.model("Account", AccountSchema)