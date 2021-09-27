// Models
const Account = require("./../models/account");
const ProductCategory = require("./../models/product_category");

//Modules
const Format = require("./../utils/format");

module.exports = {
    /**
     * Add new product category
    */
    add: async function(req, res){       
        const {accountId} = req;
        const {avatar, title, subCategory} = req.body;

        try {
            const account_db = await Account.findById(accountId);

            if(!account_db){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Bạn không có quyền thực hiện thao tác này."
                })
            }

            const prodCate_db = await ProductCategory.find({$text: {$search: title}});
            
            if(prodCate_db.length){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Danh mục này đã được tồn tại trước đó."
                })
            }

            const fm_title = title.toLowerCase().replace(/\s+/g,' ').trim();

            const newProductCategory = ProductCategory({
                avatar,
                title,
                alias: Format.alias(fm_title),
                subCategory
            });

            await newProductCategory.save();

            return res.json({
                success: true,
                message: "Dữ liệu được cập nhật",
                productCategory: newProductCategory
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
     * Add new product category
    */
    addSubCategory: async function(req, res){       
        const {accountId} = req;
        const {path, subCategory} = req.body;
        console.log({path, subCategory})

        try {
            const account_db = await Account.findById(accountId);

            if(!account_db){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Bạn không có quyền thực hiện thao tác này."
                })
            }

            const prodCate_db = await ProductCategory.findOne({title: path[0]});
            if(!prodCate_db){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Không tìm thấy danh mục sản phẩm này."
                })
            }


            // standard value
            let listSubProdCate = []
            console.log({prodCate_db})

            


            return res.json({
                success: true,
                message: "Dữ liệu được cập nhật",
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
