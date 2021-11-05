const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");
const bcrypt = require('bcrypt-nodejs');

// Modules
const Validate = require("./../utils/validate");

// Models
const Account = require("./../models/account");
const User = require("./../models/user");
const Shop = require("./../models/shop");

module.exports = {
    /**
     * Login for account
    */
    register: async function(req, res){
        const {
            userLogin, password, role
        } = req.body;
        

        try {
            res.header("Access-Control-Allow-Origin", "*");
            if(!userLogin || !password){
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "Thiếu thông tin đăng nhập"
                });
                
            }
            

            if(!Validate.validateEmail(userLogin)){
                
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "This account cannot be registered.",
                });
            }

            let account = null;
            const filter = {userLogin}
            account = await Account.findOne(filter);
            if(account){
                
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "User is already exists."
                })
            }

            var salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            const newAccount = new Account({
                userLogin,
                password: hashedPassword,
            });
            const newUser = new User({
                username: userLogin.slice(0, userLogin.indexOf("@")),
                fullName: "",
                phoneNumber: "",
                account: newAccount._id
            });

            newAccount.user = newUser._id;

            // await newAccount.save();
            // await newUser.save();
            const accessToken = jwt.sign({accountId: newAccount._id}, process.env.ACCESS_TOKEN_SECRET);

            return res.json({
                success: true,
                message: "Account created successfully",
                accessToken, 
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
     * Login for account
    */
    login: async function(req, res){
        const {
            userLogin, 
            password, 
            socialToken,
            role
        } = req.body

        try {
            let account = null;

            if(socialToken) {
                const {name, picture, email} = jwt_decode(socialToken);
                const filter = {userLogin: email, role};
                account = await Account.findOne(filter);

                if(!account) {
                    const newAccount = new Account({
                        userLogin: email,
                        password: "",
                        role
                    });
        
                    const newUser = new User({
                        avatar: picture,
                        username: email.slice(0, email.indexOf("@")),
                        fullName: name,
                        phoneNumber: "",
                        email: email,
                        account: newAccount._id
                    });
        
                    newAccount.user = newUser._id;

                    const newShop = new Shop({
                        account: newAccount._id
                    })

                    await Promise.all([
                        newAccount.save(), 
                        newUser.save(), 
                        newShop.save()
                    ]);

                    const accessToken = jwt.sign({
                        accountId: newAccount._id, role
                    }, process.env.ACCESS_TOKEN_SECRET);

                    return res.json({
                        success: true, 
                        message: "User logged successfully", 
                        accessToken
                    });
                }

                const accessToken = jwt.sign({
                    accountId: account._id, role
                }, process.env.ACCESS_TOKEN_SECRET);
    
    
                return res.json({
                    success: true, 
                    message: "User logged successfully", 
                    accessToken
                });

            } else if(!Validate.checkRequireFieldString(userLogin, password, role)) {
                return res
                .json({success: false, message: "Thiếu thông tin đăng nhập"})
            }

            const filter = {userLogin, role}
                account = await Account.findOne(filter);
                if(!account){
                    return res
                    .json({
                        success: false, 
                        message: "Không tìm thấy tài khoản này."
                    })
                }
    
                const passwordValid = bcrypt.compareSync(password, account.password);
                if(!passwordValid){
                    return res
                    .json({success: false, message: "Sai thông tin tài khoản/mật khẩu"})
                }
    
                if(role === "owner"){
                    const shop_db = await Shop.findOne({account: account._id});
                    if(!shop_db){
                        const newShop = new Shop({
                            account: account._id
                        });
    
                        await newShop.save();
                        console.log("created new shop");
                    }
                }
                
                const accessToken = jwt.sign({
                    accountId: account._id, role
                }, process.env.ACCESS_TOKEN_SECRET);
    
    
                return res.json({
                    success: true, 
                    message: "User logged successfully", 
                    accessToken
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
     * Create new account by admin
    */
    createNewAccount: async function(req, res){
        const {
            userLogin, password, role
        } = req.body;        

        try {
            res.header("Access-Control-Allow-Origin", "*");
            if(!Validate.checkRequireFieldString(userLogin, password, role)){
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "Thiếu thông tin tài khoản."
                });
                
            }

            if(!Validate.validateEmail(userLogin)){
                
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "This account cannot be registered.",
                });
            }

            let account = null;
            const filter = {userLogin}
            account = await Account.findOne(filter);
            if(account){
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "Tài khoản này đã tồn tại."
                })
            }

            var salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            const newAccount = new Account({
                userLogin,
                password: hashedPassword,
                role
            });

            const newUser = new User({
                username: userLogin.slice(0, userLogin.indexOf("@")),
                fullName: "",
                phoneNumber: "",
                email: userLogin,
                account: newAccount._id
            });

            newAccount.user = newUser._id;

            await newAccount.save();
            await newUser.save();
            const accessToken = jwt.sign({accountId: newAccount._id}, process.env.ACCESS_TOKEN_SECRET);

            return res.json({
                success: true,
                message: "Account created successfully",
                accessToken, 
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
