const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');

// Modules
const Validate = require("./../utils/validate");

// Models
const Account = require("./../models/account");
const User = require("./../models/user");

module.exports = {
    /**
     * Login for account
    */
    register: async function(req, res){
        const {
            email, password
        } = req.body;

        

        try {
            res.header("Access-Control-Allow-Origin", "*");
            if(!email || !password){
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "Missing username and/or password"
                });
                
            }
            

            if(!Validate.validateEmail(email)){
                
                return res
                .status(400)
                .json({
                    success: false, 
                    message: "This account cannot be registered.",
                });
            }

            let account = null;
            const filter = {email}
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
                email,
                password: hashedPassword,
            });
            const newUser = new User({
                username: email.slice(0, email.indexOf("@")),
                fullName: "",
                phoneNumber: "",
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

    /**
     * Login for account
    */
     login: async function(req, res){
        const {
            email, 
            password, 
            socialToken
        } = req.body

        try {
            if(!email || !password){
                return res
                .json({success: false, message: "Missing username and/or password"})
            }

            console.log({email}, {password})

            

            let account = null;
            const filter = {email}
            account = await Account.findOne(filter);
            if(!account){
                return res
                .json({
                    success: false, 
                    message: "User is not found"
                })
            }

            const passwordValid = bcrypt.compareSync(password, account.password);
            if(!passwordValid){
                return res
                .json({success: false, message: "Incorrect username or password"})
            }


            const accessToken = jwt.sign({
                accountId: account._id
            }, process.env.ACCESS_TOKEN_SECRET)
            return res.json({
                success: true, 
                message: "User logged successfully", 
                accessToken
            })

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
