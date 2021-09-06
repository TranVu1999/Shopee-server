// Models
const Shop = require("./../models/shop");
const User = require("./../models/user");


module.exports = {
    /**
     * Get information of shop
    */
    getInformation: async function(req, res){       
        const {accountId, role} = req;
        

        try {

            if(role === "owner"){
                const filter = {account: accountId};

                const shop_db = await Shop.findOne(filter);
                const user_db = await User.findOne(filter);
                console.log({shop_db})
                return res.json({
                    success: true,
                    message: "You can get this data",
                    shop: {
                        avatar: shop_db.avatar,
                        username: user_db.username,
                        backgroundImage: shop_db.backgroundImage,
                        createdDate: shop_db.createdDate,
                        brand: shop_db.brand,
                        images: shop_db.images,
                        description: shop_db.description,
                        analysis: {
                            numberProduct: 0,
                            ratioReplay: 57,
                            rangeReplay: "Trong vòng vài tiếng",
                            rating: 0,
                            ratioInvoice: 0
                        }
                    }
                });
            }

            

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
