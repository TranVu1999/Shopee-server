// Models
const Account = require("./../models/account");
const User = require("./../models/user");
const Shop = require("./../models/shop");

// Modules
const Mailer = require("./../utils/mailer");

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

    /**
     * Get short information of account
    */
    updateInformation: async function(req, res){       
        const {accountId} = req;
        const {id} = req.params;
        const {
            avatar,
            fullName,
            brand,
            gender,
            birthday
        } = req.body;

        try {
            if(accountId === id) {
                const filter = {account: accountId};
                const newUserData = { 
                    avatar,
                    fullName,
                    gender,
                    birthday
                }
                const newShopData = {
                    brand,
                    account: accountId
                }
                const optionUpdate = {new: true, upsert: true}

                const updateDatas = await Promise.all([
                    User.findOneAndUpdate( filter, newUserData, optionUpdate ),
                    Shop.findOneAndUpdate( filter, newShopData, optionUpdate)
                ]);

                console.log({updateDatas})

                const resDataUpdate = {
                    avatar: updateDatas[0].avatar,
                    username: updateDatas[0].username,
                    fullName: updateDatas[0].fullName,
                    phoneNumber: updateDatas[0].phoneNumber,
                    email: updateDatas[0].email,
                    gender: updateDatas[0].gender,
                    birthday: updateDatas[0].birthday,
                    brand: updateDatas[1].brand
                }

                

                return res.json({
                    success: true,
                    message: "You can get this data",
                    user: resDataUpdate
                });
            }

            return res.json({
                success: true,
                message: "Bạn không thể thực hiện thao tác này"
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
    sendMailer: async function(req, res){     


        try {
            Mailer.sendMail();
            return res.json({
                success: true,
                message: "Bạn không thể thực hiện thao tác này"
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
