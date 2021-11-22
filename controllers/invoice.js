// Models
const Account = require("./../models/account");
const User = require("./../models/user");
const Shop = require("./../models/shop");
const Address = require("./../models/address");
const Product = require("./../models/product");
const Invoice = require("./../models/invoice");
const InvoiceDetail = require("./../models/invoice_detail");
const Cart = require("./../models/cart");

// Modules
const Mailer = require("./../utils/mailer");

const getInvoiceDetail = (listInvoiceDetail) => {
  console.log({listInvoiceDetail});

  const listInvoice = [];
  listInvoiceDetail.forEach(invoiceDetail => {
    if(invoiceDetail.invoice) {
      const indexInvoice = listInvoice.findIndex(invoice => invoice._id.toString() === invoiceDetail.invoice._id.toString());

      const product = {
        _id: invoiceDetail.product._id,
        title: invoiceDetail.product.title,
        alias: invoiceDetail.product.alias,
        avatar: invoiceDetail.image,
        variant: invoiceDetail.variant,
        price: invoiceDetail.price,
        amount: invoiceDetail.amount
      }

      if(indexInvoice === -1) {
        const shop = {
          _id: invoiceDetail.invoice.shop._id,
          brand: invoiceDetail.invoice.shop.brand,
          alias: invoiceDetail.invoice.shop.alias
        }

        const newInvoice = {
          _id: invoiceDetail.invoice._id,
          statuation: invoiceDetail.invoice.statuation,
          total: invoiceDetail.invoice.total,
          route: invoiceDetail.invoice.route,
          receivedAddress: invoiceDetail.invoice.receivedAddress,
          shop,
          listProduct: [product]
        }

        listInvoice.push(newInvoice);

      } else {
        listInvoice[indexInvoice].listProduct.push(product);
      }
    }
    
  });

  return listInvoice;
}

module.exports = {
  /**
   * Function: add new invoice by user,
   * Params: accountId
   * Description:
   */
  add: async function (req, res) {
    const { accountId } = req;
    const { listShop, receivedAddress } = req.body;

    try {
      const listInvoicePromise = [];
      const listUpdateProductPromise = [];
      const listInvoiceDetailPromise = [];
      const listCartPromise = [];
      let mailerListProduct = "";
      let totalPrice = 0;
      let urlVerify = "";

      listShop.forEach((shop) => {
        const newInvoice = new Invoice({
          account: accountId,
          shop: shop.shopId,
          receivedAddress,
          message: shop.message,
        });
        urlVerify += newInvoice._id + ".";

        let total = 0;
        shop.listProduct.forEach((prod) => {
          const { title, price, image, variant, amount } = prod;
          total += amount * price;

          const newInvoiceDetail = new InvoiceDetail({
            invoice: newInvoice._id,
            product: prod.productId,
            amount: prod.amount,
            variant,
            price,
            image,
            title,
          });
          listInvoiceDetailPromise.push(newInvoiceDetail.save());
          listCartPromise.push(
            Cart.findOneAndDelete({ _id: prod.cartId, account: accountId })
          );
          listUpdateProductPromise.push(
            Product.findByIdAndUpdate(
              { _id: prod.productId },
              { $inc: { scoreView: 3, soldNumber: 1 } }
            )
          );

          mailerListProduct += `<div style="display: flex; margin-bottom: 6px;">
                <div style="margin-right: 14px;">
                    <img src=${image} alt="product" width="80">
                </div>
                <div style="flex: 1">
                    <h5 style="margin: 0 0 8px; font-size: 16px; color: rgba(0,0,0,.8)">${title}</h5>
                    <span>Loại: ${
                      variant
                        ? `${variant.firstClassificationName}, ${variant.secondClassificationName}`
                        : ""
                    }</span>
                </div>
                <div style="min-width: 100px; text-align: right">
                    <p style="margin: 0; color: #ee4d2d; font-size: 15px;">${price}đ</p>
                    <span style="color: rgba(0,0,0,.6);">Số lượng: <b>${amount}</b></span>
                </div>
            </div>`;
        });
        newInvoice.total = total;
        totalPrice += total;

        listInvoicePromise.push(newInvoice.save());
      });

      const [user_db, account_db, address_db] = await Promise.all([
        User.findOne({ account: accountId }),
        Account.findById(accountId),
        Address.findOne({ _id: receivedAddress, account: accountId }),
        ...listInvoiceDetailPromise,
        ...listInvoicePromise,
        ...listCartPromise,
        ...listUpdateProductPromise,
      ]);

      const content = `<div style = "width: 600px; margin: 0 auto; font-size: 14px;">
          <div style="text-align: center">
              <img src="https://ci6.googleusercontent.com/proxy/pYFHITRPqvhJTw_S-07ijzWoaEBQAzRP2pEx0td9IIihdWyPRk-YTRHGwEkm3CIgZtGxN3yi13JhXCixF_4piF9xAjvOdFZqQX0jD1E=s0-d-e1-ft#https://cf.shopee.sg/file/0cd023d64f04491f3dc8076d6932dfdc" alt="" width="120">
          </div>
          <p>Cám ơn bạn <b>${
            user_db.fullName
          }</b> đã cho chúng tôi cơ hội phục vụ. Nhân viên sẽ liên hệ lại với quý khác để các nhận giao hàng chậm nhất 24h.</p>
          <div style="padding: .375rem .875rem; background-color: #f3f3f3; text-transform: uppercase">Thông tin đặt hàng</div>
          <div>
              <p><span>Họ Tên: </span> <b>${user_db.fullName}</b></p>
              <p><span>Địa chỉ: </span> <b>${address_db.houseNumber}, ${
        address_db.ward
      }, ${address_db.district}, ${address_db.province}</b></p>
              <p><span>Số điện thoại: </span> <b>(84+) ${
                address_db.phoneNumber
              }</b></p>
          </div>
          <p>Ghi chú: Đừng cho ai biết!</p>
          <div style="padding: .375rem .875rem; margin-bottom: 16px; background-color: #f3f3f3; text-transform: uppercase">Sản phẩm đã mua</div>
          ${mailerListProduct}
          <div style="padding: .375rem .875rem; margin: 16px 0; background-color: #f3f3f3; text-transform: uppercase">Tổng cộng</div>
          <div style="margin-bottom: 24px; text-align: right">
              <p>Tổng tiền: <b style="display: inline-block; min-width: 100px;">${totalPrice}đ</b></p>
              <p>Chi phí vận chuyển: <b style="display: inline-block; min-width: 100px;">38.000đ</b></p>
              <p>Tổng chi phí: <b style="display: inline-block; min-width: 100px;">${
                totalPrice + 38000
              }đ</b></p>
          </div>

          <p style="border-top: 2px solid #ee4d2d; padding-top: 16px;">Nhấn <a href=${
            "http://localhost:3000/purchase-verify/" +
            urlVerify.slice(0, urlVerify.length - 1)
          } style="text-decoration: none; color: #ee4d2d; font-size: 20px;">tại đây</a> để chúng tôi có thể xác nhận được thông tin đơn hàng của bạn!</p>
          <p>Đường link này chỉ tôn tại trong vòng 24h.</p>
          <p style="margin-bottom: 20px;">Hóa đơn này sẽ bị hủy trong vòng 24h nếu bạn không xác nhận.</p>
          <p>Trân trọng,</p>
          <p>Đội ngũ Shopee</p>
      </div>`;

      await Mailer.sendVerifyCode(
        account_db.userLogin,
        "Xác nhận thông tin hóa đơn",
        content
      );

      return res.json({
        success: true,
        message: "Đặt hàng thành công!",
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
   * Function: confrim invoice,
   * Params: accountId, list invoice_id
   * Description:
   */
  verify: async function (req, res) {
    const { accountId } = req;
    const { listInvoice } = req.body;

    try {
      const listInvoiceUpdate = [];
      listInvoice.forEach((invoice_id) => {
        listInvoiceUpdate.push(
          Invoice.findOneAndUpdate(
            { account: accountId, _id: invoice_id },
            { 
              statuation: "Chờ xác nhận",
              $push: {route: {time: new Date(), label: "Đã xác nhận thông tin thanh toán"}}
            }
          )
        );
      });

      await Promise.all(listInvoiceUpdate);

      return res.json({
        success: true,
        message: "Đơn hàng được xác nhận",
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
   * Function: Get list invoice of shop,
   * Params: accountId
   * Description:
   */
  getListInvoiceByShop: async function (req, res) {
    const { accountId } = req;
    console.log({accountId})
    try {
      const shop_db = await Shop.findOne({ account: accountId });

      const listInvoiceDetail_db = await InvoiceDetail.find().lean().populate({
        path: "invoice",
        match: {shop: shop_db._id},
        populate: {
          path: "account",
          populate: {
            path: 'user',
            select: "username avatar"
          }
        }
      });

      const listInvoice = [];
      listInvoiceDetail_db.forEach(invoiceDetail_db => {
        if(invoiceDetail_db.invoice) {
          const {
            _id, total, 
            statuation, 
            createdDate,
            account
          } = invoiceDetail_db.invoice;

          const {
            variant, 
            amount, 
            image, 
            price, 
            title
          } = invoiceDetail_db;

          const product = {
            _id: invoiceDetail_db._id,
            amount,
            title,
            price,
            variant,
            image
          }

          const index = listInvoice.findIndex(invoice => invoice._id.toString() === _id.toString());


          if(index !== -1) {
            listInvoice[index].listProduct.push(product);
          } else {
            const invoice = {
              _id,
              total,
              statuation,
              createdDate,
              account: {
                _id: account._id,
                avatar: account.user.avatar,
                username: account.user.username
              },
              listProduct: [product]
            }

            listInvoice.push(invoice);
          }
        }
      })

      return res.json({
        success: true,
        message: "Đặt hàng thành công!",
        listInvoice
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
   * Function: Get list user's invoice,
   * Params: accountId
   * Description:
   */
  get: async function (req, res) {
    const { accountId } = req;

    try {

      const listInvoiceDetail_db = await InvoiceDetail.find().lean()
      .populate("product")
      .populate({
        path: "invoice",
        match: {statuation: {$ne: "Đơn hàng đã đặt"}},
        populate: [{
          path: "account",
          match: {_id: accountId},
          select: "userLogin"
        }, {path: "shop", select: "avatar brand"}]
      });

      const listInvoice = getInvoiceDetail(listInvoiceDetail_db);
      

      return res.json({
        success: true,
        message: "Đặt hàng thành công!",
        listInvoice
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
   * Function: Get invoice detail,
   * Params: accountId, invoiceId
   * Description:
   */
   getDetail: async function (req, res) {
    const { accountId } = req;
    const invoiceId = req.params.id;

    try {
      const listInvoiceDetail_db = await InvoiceDetail
      .find({invoice: invoiceId})
      .lean()
      .populate("product")
      .populate({
        path: "invoice",
        match: {statuation: {$ne: "Đơn hàng đã đặt"}},
        populate: [{
          path: "account",
          match: {_id: accountId},
          select: "userLogin"
        }, {path: "shop", select: "avatar brand"},
        {path: "receivedAddress", select: "fullname phoneNumber houseNumber ward district province"}  
        ]
      });

      const invoice = getInvoiceDetail(listInvoiceDetail_db)[0];

      return res.json({
        success: true,
        message: "Đặt hàng thành công!",
        invoice
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
