// Models
const Shop = require("./../models/shop");
const Account = require("./../models/account");
const User = require("./../models/user");

// Module
const Format = require('./../utils/format');
const Validate = require('./../utils/validate');

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

    /**
     * Put information of shop
    */
    updateInformation: async function(req, res){        
        const {accountId, role} = req;
        let {
            avatar,
            backgroundImage,
            description,
            brand,
            images
        } = req.body;

        

        try {

            let shop_db = await Shop.findOne({account: accountId});

            if(role === "owner" && shop_db){
                if(!brand){
                    return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Không được để trống trường này."
                    });
                } 

                const fm_brand = brand.replace(/\s+/g,' ').trim();
                
               shop_db = await Shop.findOne({brand: fm_brand});
                if(shop_db){
                    return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Thương hiệu này đã tồn tại."
                    });
                }

                const updateData = {
                    brand: fm_brand,
                    alias: Format.alias(fm_brand),
                    backgroundImage,
                    images,
                    avatar,
                    description
                }

                const updateShop = await Shop.findOneAndUpdate(
                    {account: accountId},
                    updateData,
                    {new: true}
                );


                return res
                    .json({
                        success: true,
                        message: "Thành công",
                        shop: updateShop
                    });

            }

            return res
            .status(400)
            .json({
                success: false,
                message: "Bạn không có quyền truy cập tại đường link này."
            });

        } catch (error) {
            console.log(error)
            return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}
