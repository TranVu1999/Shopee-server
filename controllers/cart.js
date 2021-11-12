// Models
const Cart = require("./../models/cart");

module.exports = {
  /**
   * Function: add new product into cart,
   * Params: accountId, productId, phân loại,
   * Description:
   * - The filter: accountId, productId, classification
   * - Found: update amound of document is found.
   * - Otherwise: add new document into cart.
   */
  add: async function (req, res) {
    const { accountId } = req;
    const { product, amount, classification } = req.body;

    try {
      const filter = {
        account: accountId,
        product,
        "classification.first": classification.first,
        "classification.second": classification.second,
      };

      const cart = await Cart.findOneAndUpdate(
        filter,
        {
          account: accountId,
          product,
          amount,
          classification,
        },
        {
          new: true,
          upsert: true,
        }
      ).lean();

      return res.json({
        success: true,
        message: "Thêm vào giỏ hàng thành công!",
        cart,
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
   * Function: get list product from cart by account,
   * Params: accountId,
   * Description:
   * -
   */
  get: async function (req, res) {
    const { accountId } = req;

    try {
        const carts_db = await Cart.find()
        .lean()
        .populate({
            path: "product",
            select: "avatar title alias classification account price",

            populate: {
            path: "shop",
            select: "avatar brand alias"
            }
        });

        const listShop = [];
        carts_db.forEach(row => {
            const isExist = listShop.some(shop => shop._id === row.product.shop._id);

            if(!isExist) {
                listShop.push({
                    ...row.product.shop,
                    listProduct: []
                });
            }
        });

        listShop.forEach(shop => {
            carts_db.forEach(row => {
                if(shop._id === row.product.shop._id) {
                    shop.listProduct.push({
                        _id: row._id,
                        amount: row.amount,
                        classification: row.classification,
                        product: {
                            _id: row.product._id,
                            avatar: row.product.avatar,
                            title: row.product.title,
                            alias: row.product.alias,
                            price: row.product.price,
                            classification: row.product.classification
                        }
                    })
                }
            })
        })

      return res.json({
        success: true,
        message: "123Lấy dữ liệu thành công!",
        cart: listShop
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
