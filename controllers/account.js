// Models
const Account = require("./../models/account");
const User = require("./../models/user");
const Shop = require("./../models/shop");

// Modules
const Mailer = require("./../utils/mailer");
const Other = require("./../utils/other");

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
    getPassword: async function(req, res){       
        const {accountId} = req;

        try {
            const account_db = await Account.findById(accountId);

            if(!account_db){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Bạn không thể lấy thông tin của tài khoản này"
                })
            }

            return res.json({
                success: true,
                message: "You can get this data",
                password: account_db.password
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
     * send verify code
    */
    sendVerifyCode: async function(req, res){       
        const {accountId} = req;

        try {
            const account_db = await Account.findById(accountId);

            if(!account_db){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Bạn không thể lấy thông tin của tài khoản này"
                })
            }

            const verifyCode = Other.createRandomString(6);

            const content = `<div style = "width: 560px; margin: 0 auto; font-size: 14px;">
                <div style="text-align: center">
                    <img src="https://ci6.googleusercontent.com/proxy/pYFHITRPqvhJTw_S-07ijzWoaEBQAzRP2pEx0td9IIihdWyPRk-YTRHGwEkm3CIgZtGxN3yi13JhXCixF_4piF9xAjvOdFZqQX0jD1E=s0-d-e1-ft#https://cf.shopee.sg/file/0cd023d64f04491f3dc8076d6932dfdc" alt="" width="120">
                </div>
                <div>
                    <p>Xin chào ${account_db.username}</p>
                    <p>Chúng tôi nhận được yêu cầu theiets lập lại mật khẩu cho tài khoản shopee của bạn.</p>
                    <p>Nhấn <a href="#" style="text-decoration: none; color: #ee4d2d;">tại đây</a> để quay về trang thiết lập mật khẩu mới cho tài khoản Shopee của bạn.</p>
                    <p>Chúng tôi xin được gởi mã xác nhận tới bạn: <strong>${verifyCode}</strong></p>
                    <p>Mã này chỉ tồn tại trong khoảng 3 phút.</p>
                    <p>Mã này sẽ vô hiệu nếu quá thời gian quy định.</p>
                    <br><br><br>
                    <p>Trân trọng,</p>
                    <p>Đội ngũ Shopee</p>
                </div>
            </div>`;

            await Mailer.sendVerifyCode(account_db.userLogin, "Thiết lập lại mật khẩu đăng nhập", content);

            return res.json({
                success: true,
                message: "Mã xác nhận đã được gởi",
                verifyCode
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
    }

}
