const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    avatar: {
        type: String,
        default: ""
    },
    
    username: {
        type: String,
        default: ""
    },

    fullName: {
        type: String,
        default: ""
    },

    phoneNumber: {
        type: String,
        default: ""
    },

    email: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        default: "male"
    },

    birthday: {
        type: Date,
        default: new Date()
    },
    
    account: {
        type: Schema.Types.ObjectId,
        ref: "Account"
    }
});

module.exports = mongoose.model("User", UserSchema)