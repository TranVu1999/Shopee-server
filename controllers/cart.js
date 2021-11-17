// Models
const Cart = require("./../models/cart");


const formatCart = async (accountId) => {
  const carts_db = await Cart.find({account: accountId})
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
  });

  return listShop;
}

module.exports = {
  /**
   * Function: add new product into cart,
   * Params: accountId, productId, classification,
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

      await Cart.findOneAndUpdate(
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

      const cart = await formatCart(accountId);

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
   * Function: upadate product in cart,
   * Params: accountId, cartId,
   * Data: "productId, classification, amount"
   * Description:
   * - The filter: accountId, productId, classification
   * - Found: update amound of document is found.
   * - Otherwise: add new document into cart.
   */
  update: async function (req, res) {
    const { accountId } = req;
    const cartId = req.params.id;
    const { product, amount, classification } = req.body;
    console.log({cartId});

    try {

      const filter = {
        account: accountId,
        product,
        "classification.first": classification.first,
        "classification.second": classification.second,
      };

      const cartDuplicate = await Cart.findOne(filter).lean();
      

      if(!cartDuplicate || cartDuplicate._id.toString() === cartId) {
        await Cart.findByIdAndUpdate(cartId, {
          amount,
          classification,
        });
      } else {
        await Promise.all([
          Cart.findByIdAndUpdate(cartDuplicate._id, {
            amount: amount + cartDuplicate.amount,
            classification,
          }),
          Cart.findByIdAndRemove(cartId)
        ])
      }

      const cart = await formatCart(accountId);

      return res.json({
        success: true,
        message: "Cập nhật giỏ hàng thành công!",
        cart
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
   * Function: remove cart,
   * Params: accountId, cartId,
   * Description:
   * - 
   */
  remove: async function (req, res) {
    const { accountId } = req;
    const cartId = req.params.id;

    try {

      await Cart.findOneAndDelete({account: accountId, _id: cartId});

      const cart = await formatCart(accountId);

      return res.json({
        success: true,
        message: "Cập nhật giỏ hàng thành công!",
        cart
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
   * Function: remove multi cart item,
   * Params: accountId,
   * Description:
   * - remove multi cartItem of account
   */
   removeMulti: async function (req, res) {
    const { accountId } = req;
    const {listCartItem} = req.body;

    try {
      const listRemoveApi = [];
      listCartItem.forEach(cartItem => {
        listRemoveApi.push(Cart.findOneAndDelete({_id: cartItem, account: accountId}));
      })

      await Promise.all(listRemoveApi);
      const cart = await formatCart(accountId);

      return res.json({
        success: true,
        message: "Cập nhật giỏ hàng thành công!",
        cart
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
      const cart = await formatCart(accountId);

      return res.json({
        success: true,
        message: "123Lấy dữ liệu thành công!",
        cart
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
