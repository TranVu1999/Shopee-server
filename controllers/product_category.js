// Models
const { createConnection } = require("mongoose");
const Account = require("./../models/account");
const ProductCategory = require("./../models/product_category");

//Modules
const Format = require("./../utils/format");

Array.prototype.equals = function (arr){
    const lengthArr = arr.length;

    if(!lengthArr) return false;
    if(lengthArr !== this.length) return false;

    for(let idex = 0; idex < lengthArr; idex++){

        if(this[idex].toString() !== arr[idex].toString()) return false;
    }
    
    
    return true;
}

module.exports = {
    /**
     * Add new product category
    */
    add: async function(req, res){       
        const {accountId} = req;
        const {
            path,
            listCat
        } = req.body;

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

            const prodCat_db = await ProductCategory.find().lean();

            if(path.length){
                const isAccept = path.every(cat => {
                    return prodCat_db.some(cat_db => {
                        return cat === cat_db._id.toString()
                    })
                });

                if(!isAccept){
                    return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Đường dẫn danh mục sản phẩm của bạn không đúng"
                    })
                }
            }

            listCat.forEach(async (cat) => {
                const isDuplicateTitle = prodCat_db.some(cat_db => cat_db.title === cat.title && cat_db.path.equals(path));

                console.log({isDuplicateTitle})

                if(!isDuplicateTitle){
                    const fm_title = cat.title.toLowerCase().replace(/\s+/g,' ').trim();

                    const newProductCategory = ProductCategory({
                        avatar: cat.avatar || "",
                        title: cat.title,
                        path,
                        alias: Format.alias(fm_title),
                    });

                    await newProductCategory.save();
                }
            });

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

    /**
     * Update product category
    */
    update: async function(req, res){ 
        const prodCateId = req.params.id;
        const {skeletonAttribute} = req.body;
        const {accountId, role} = req; 

        console.log({accountId, role});

        try {
            const admin_db = Account.findOne({_id: accountId, role});
            if(!admin_db){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Bạn không có quyền sử dụng API này."
                });
            }

            let updateProdCate = ProductCategory.findOneAndUpdate({
                skeletonAttribute
            }, {new: true});
            
            if(!updateProdCate){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Thao tác không thành công."
                });
            }

            return res.json({
                success: true,
                message: "Thao tác thành công.",
                productCategory: updateProdCate
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
     * Get all product category
    */
    getAll: async function(req, res){  

        try {
            const cats_db = await ProductCategory.find().lean();

            const topLevel = cats_db.reduce((result, cat_db) => cat_db.path.length > result ? cat_db.path.length : result, 0);

            // format tree
            let numberBranch = 0;
            let listCatsInBranch = [];


            do{
                listCatsInBranch.push(
                    cats_db.filter(cat_db => cat_db.path.length === numberBranch).map(cat_db => {
                        return {
                            ...cat_db, 
                            subCategories: []
                        }
                    })
                );

                numberBranch++;
            }while(numberBranch <= topLevel);

            for( let i = topLevel - 1; i >= 0; i--){

                let lengthBranch = listCatsInBranch[i].length;
                for( let j = 0; j < lengthBranch; j++ ){
                    

                    let subCategories =  listCatsInBranch[i + 1].filter(cat => {
                        return cat.path[cat.path.length - 1].toString() === listCatsInBranch[i][j]._id.toString();
                    });

                    listCatsInBranch[i][j].subCategories = [...subCategories];
                }
            }            

            return res.json({
                success: true,
                message: "Thao tác thành công.",
                productCategories: listCatsInBranch[0]
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
