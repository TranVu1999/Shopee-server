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
                    <span>Lo???i: ${
                      variant
                        ? `${variant.firstClassificationName}, ${variant.secondClassificationName}`
                        : ""
                    }</span>
                </div>
                <div style="min-width: 100px; text-align: right">
                    <p style="margin: 0; color: #ee4d2d; font-size: 15px;">${price}??</p>
                    <span style="color: rgba(0,0,0,.6);">S??? l?????ng: <b>${amount}</b></span>
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
          <p>C??m ??n b???n <b>${
            user_db.fullName
          }</b> ???? cho ch??ng t??i c?? h???i ph???c v???. Nh??n vi??n s??? li??n h??? l???i v???i qu?? kh??c ????? c??c nh???n giao h??ng ch???m nh???t 24h.</p>
          <div style="padding: .375rem .875rem; background-color: #f3f3f3; text-transform: uppercase">Th??ng tin ?????t h??ng</div>
          <div>
              <p><span>H??? T??n: </span> <b>${user_db.fullName}</b></p>
              <p><span>?????a ch???: </span> <b>${address_db.houseNumber}, ${
        address_db.ward
      }, ${address_db.district}, ${address_db.province}</b></p>
              <p><span>S??? ??i???n tho???i: </span> <b>(84+) ${
                address_db.phoneNumber
              }</b></p>
          </div>
          <p>Ghi ch??: ?????ng cho ai bi???t!</p>
          <div style="padding: .375rem .875rem; margin-bottom: 16px; background-color: #f3f3f3; text-transform: uppercase">S???n ph???m ???? mua</div>
          ${mailerListProduct}
          <div style="padding: .375rem .875rem; margin: 16px 0; background-color: #f3f3f3; text-transform: uppercase">T???ng c???ng</div>
          <div style="margin-bottom: 24px; text-align: right">
              <p>T???ng ti???n: <b style="display: inline-block; min-width: 100px;">${totalPrice}??</b></p>
              <p>Chi ph?? v???n chuy???n: <b style="display: inline-block; min-width: 100px;">38.000??</b></p>
              <p>T???ng chi ph??: <b style="display: inline-block; min-width: 100px;">${
                totalPrice + 38000
              }??</b></p>
          </div>

          <p style="border-top: 2px solid #ee4d2d; padding-top: 16px;">Nh???n <a href=${
            "http://localhost:3000/purchase-verify/" +
            urlVerify.slice(0, urlVerify.length - 1)
          } style="text-decoration: none; color: #ee4d2d; font-size: 20px;">t???i ????y</a> ????? ch??ng t??i c?? th??? x??c nh???n ???????c th??ng tin ????n h??ng c???a b???n!</p>
          <p>???????ng link n??y ch??? t??n t???i trong v??ng 24h.</p>
          <p style="margin-bottom: 20px;">H??a ????n n??y s??? b??? h???y trong v??ng 24h n???u b???n kh??ng x??c nh???n.</p>
          <p>Tr??n tr???ng,</p>
          <p>?????i ng?? Shopee</p>
      </div>`;

      await Mailer.sendVerifyCode(
        account_db.userLogin,
        "X??c nh???n th??ng tin h??a ????n",
        content
      );

      return res.json({
        success: true,
        message: "?????t h??ng th??nh c??ng!",
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
              statuation: "Ch??? x??c nh???n",
              $push: {route: {time: new Date(), label: "???? x??c nh???n th??ng tin thanh to??n"}}
            }
          )
        );
      });

      await Promise.all(listInvoiceUpdate);

      return res.json({
        success: true,
        message: "????n h??ng ???????c x??c nh???n",
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
    console.log("hello");
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
        message: "?????t h??ng th??nh c??ng!",
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
        match: {statuation: {$ne: "????n h??ng ???? ?????t"}},
        populate: [{
          path: "account",
          match: {_id: accountId},
          select: "userLogin"
        }, {path: "shop", select: "avatar brand"}]
      });

      const listInvoice = getInvoiceDetail(listInvoiceDetail_db);
      

      return res.json({
        success: true,
        message: "?????t h??ng th??nh c??ng!",
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
        match: {statuation: {$ne: "????n h??ng ???? ?????t"}},
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
        message: "?????t h??ng th??nh c??ng!",
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
