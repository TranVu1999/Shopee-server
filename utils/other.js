let nodemailer = require("nodemailer")

module.exports = {
    /**
     * Create random a string.
     * @param {string} length The length of string.
     */
    createRandomString: function (length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
        for (var i = 0; i < length; i++)
           text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },
}