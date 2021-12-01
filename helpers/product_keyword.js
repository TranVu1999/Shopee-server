// models
const ProductKeyword = require("./../models/product_keyword");
// utils
const Format = require("./../utils/format");

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

module.exports = {

    addNewProductKeyword: async (listKeyword, listProduct) => {

        const listProdKeyword_db = await Promise.all(
            listKeyword.map(keyword => ProductKeyword.findOne({keyword}).lean())
        );
    
        const promises = [];
        listProdKeyword_db.forEach((prodKeyword_db, index) => {
            if(prodKeyword_db) {
                const listProductUpdate = [];
                
                listProduct.forEach(prod => {
                    const index = prodKeyword_db.listProduct.findIndex(prod_db => prod_db.productId === prod);
    
                    if(index === -1) {
                        listProductUpdate.push({
                            productId: prod,
                            score: 1
                        });
                    } else {
                        promises.push(ProductKeyword.findOneAndUpdate(
                            { _id: prodKeyword_db._id, "listProduct.productId": prod },
                            {$inc: {"listProduct.$.score" : 1} }
                        ))
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
                    listProduct: listProduct.map(prod => ({productId: prod, score: 1}))
                });
        
                promises.push(newProductKeyword.save());
            }
        });
    
        await Promise.all(promises);   
    
    },

    sortListKeyword: (listKeyword, keysearch) => {
        const lengthKey = listKeyword.length;
        for(let i = 0; i < lengthKey; i++) {
            const score = valuatedKeyword(listKeyword[i].keyword, keysearch);

            if(score) {
                listKeyword[i].score = score + listKeyword[i].scoreView;
            } else {
                listKeyword[i].score = 0;
            }
        }
    
        return listKeyword.sort((a, b) => b.score - a.score).filter(keyword => keyword.score);
    }

}