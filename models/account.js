const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    userLogin: {
        type: String,
        default: "",
        index: true // field level
    },

    password: {
        type: String,
        default: ""
    },

    listTracker: [{
        type: Schema.Types.ObjectId,
        ref: "Shop"
    }],

    invoices: {
        type: Array,
        default: []
    },

    reports: {
        type: Array,
        default: []
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
        type: String,
        default: ""
    },

    role: {
        type: String,
        default: 'user'
    },

    status: {
        type: Boolean,
        default: true
    },

    productKeyword: {
        type: Array,
        default: []
    }
});

// AccountSchema.index({userLogin: 1, password: 1}); // schema level

module.exports = mongoose.model("Account", AccountSchema)