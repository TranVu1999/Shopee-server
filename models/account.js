const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    userLogin: {
        type: String,
        default: ""
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
    }
});

module.exports = mongoose.model("Account", AccountSchema)