const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    avatar: {
        type: String,
    },
    
    username: {
        type: String,
        require: true
    },

    fullName: {
        type: String,
        require: true
    },

    phoneNumber: {
        type: String,
        require: true
    },

    gender: {
        type: String
    },

    birthday: {
        type: Date
    },
    
    account: {
        type: Schema.Types.ObjectId,
        ref: "Account"
    }
});

module.exports = mongoose.model("User", UserSchema)