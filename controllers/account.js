// Models
const Account = require("./../models/account");
const User = require("./../models/user");

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
}
