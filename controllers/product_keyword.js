const jwt = require("jsonwebtoken");
// Models
const ProductKeyword = require("./../models/product_keyword");
const Account = require("./../models/account");

// modules
const Format = require("./../utils/format");

const addNewProductKeyword = async (listKeyword, listProduct) => {

    const listProdKeyword_db = await Promise.all(
        listKeyword.map(keyword => ProductKeyword.findOne({keyword}).lean())
    );

    const promises = [];
    listProdKeyword_db.forEach((prodKeyword_db, index) => {
        if(prodKeyword_db) {
            const listProductUpdate = [];
            listProduct.forEach(prod => {
                const isExist = prodKeyword_db.listProduct.some(prod_db => prod_db.productId === prod);

                if(!isExist) {
                    listProductUpdate.push({
                        productId: prod,
                        score: 0
                    });
                }
            });
    
            if(listProductUpdate.length) {
                promises.push(ProductKeyword.findByIdAndUpdate(
                    prodKeyword_db._id, 
                    {$push: { listProduct: { $each: [ ...listProductUpdate ] } } }
                ))
            }
        } else {
            const newProductKeyword = new ProductKeyword({
                keyword: listKeyword[index],
                listProduct: listProduct.map(prod => ({productId: prod, score: 0}))
            });
    
            promises.push(newProductKeyword.save());
        }
    });

    await Promise.all(promises);   

}

const valuatedKeyword = (resKey, desKey) => {
    let score = 0;
    const resWordArr = Format.removeAccents(resKey).toLowerCase().split(" ");
    const desWordArr = desKey.toLowerCase().split("-");

    desWordArr.forEach(desWord => {
        const isMatch = resWordArr.some(resWord => resWord === desWord);

        if(isMatch) {
            score += 10 * desWord.length;
        }
    });

    return score;
}

const sortListKeyword = (listKeyword, keysearch) => {
    const lengthKey = listKeyword.length;
    for(let i = 0; i < lengthKey; i++) {
        const score = valuatedKeyword(listKeyword[i].keyword, keysearch);

        listKeyword[i].score = score + listKeyword[i].scoreView;
    }

    return listKeyword.sort((a, b) => b.score - a.score);
}

module.exports = {
    /**
    * Add new product's keyword
    */
    add: async function (req, res) {
        const {listKeyword, listProduct, accessToken } = req.body;

        try {

        await addNewProductKeyword(listKeyword, listProduct);

        return res.json({
            success: true,
            message: "Thêm từ khóa sản phẩm thành công",
        });
        } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
        }
    },

    /**
    * Get list product's keyword matched
    */
    getListMatched: async function (req, res) {
        const {keyword} = req.params;

        try {
            const listProdKeyword_db = await ProductKeyword.find().lean();

            const listProdKeyword = sortListKeyword(listProdKeyword_db, keyword).filter(key => key.score > 0).map(key => key.keyword);

            return res.json({
                success: true,
                message: "Dữ liệu được trả về",
                listProdKeyword
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    },
};
