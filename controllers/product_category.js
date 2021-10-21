// Models
const { createConnection } = require("mongoose");
const Account = require("./../models/account");
const ProductCategory = require("./../models/product_category");

//Modules
const Format = require("./../utils/format");
const Validate = require("./../utils/validate");

Array.prototype.equals = function (arr){
    const lengthArr = arr.length;

    if(!lengthArr) return false;
    if(lengthArr !== this.length) return false;

    for(let idex = 0; idex < lengthArr; idex++){

        if(this[idex].toString() !== arr[idex].toString()) return false;
    }
    
    
    return true;
}

const handleExceptFromSystem = (err, res) =>{
    console.log(err);
    return res
    .status(500)
    .json({
        success: false,
        message: "Internal server error"
    })
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
        const {
            isTop,
            isRoot,
            title,
            skeletonAttribute
        } = req.body;

        const {accountId, role} = req; 

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

            if(!Validate.checkRequireFieldString(title)){
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Dữ liệu của bạn không hợp lệ."
                });
            }


            const fm_title = title.toLowerCase().replace(/\s+/g,' ').trim();

            let updateProdCate = await ProductCategory.findOneAndUpdate(
                {_id: prodCateId}, 
                {
                    skeletonAttribute,
                    isTop,
                    title: fm_title,
                    alias: Format.alias(fm_title),
                }, 
                {new: true}
            );
            
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
        console.log("get all");
        
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


    /**
     * Get product category by id
    */
    getById: async function(req, res){  
        const {id, type} = req.params;

        console.log({id, type});

        try {
            let res_prodCat = null;

            switch(type){
                case 'skeleton-attribute':
                    const filter = {_id: id, isTop: true};
                    res_prodCat = await ProductCategory.findOne(filter);
                    break;
                default:
                    break;
            }
            
            if(res_prodCat){
                return res.json({
                    success: true,
                    message: "Thao tác thành công.",
                    productCategory: res_prodCat
                });
            }else{
                return res
                .status(400)
                .json({
                    success: false,
                    message: "Thao tác không thành công"
                })
            }
        } catch (error) {
            return handleExceptFromSystem(error, res);
        }
    },
}
