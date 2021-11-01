// Models
const Account = require("./../models/account");
const User = require("./../models/user");
const Shop = require("./../models/shop");

module.exports = {
    /**
     * Get short information of account
    */
    getShortInformation: async function(req, res){       
        const {accountId} = req;

        try {
            const user = await User.findOne({account: accountId});

            if(!user){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Cannot get information of this account."
                })
            }

            const resUser = {
                avatar: user.avatar,
                username: user.username
            }

            return res.json({
                success: true,
                message: "You can get this data",
                user: resUser
            });

        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            })
        }
    },

    /**
     * Get short information of account
    */
    getFullInformation: async function(req, res){       
        const {accountId} = req;

        try {
            const filter = {account: accountId};
            const user = await User.findOne(filter);
            const shop = await Shop.findOne(filter)

            if(!user){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Cannot get information of this account."
                })
            }

            const resUser = {
                avatar: user.avatar,
                username: user.username,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                gender: user.gender,
                birthday: user.birthday,
                brand: shop ? shop.brand : ""
            }

            return res.json({
                success: true,
                message: "You can get this data",
                user: resUser
            });

        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            })
        }
    },
}
