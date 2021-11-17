// Models
const Account = require("./../models/account");
const User = require("./../models/user");
const Address = require("./../models/address");
const Product = require("./../models/product");
const Invoice = require("./../models/invoice");
const InvoiceDetail = require("./../models/invoice_detail");
const Cart = require("./../models/cart");

// Modules
const Mailer = require("./../utils/mailer");

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

      listShop.forEach((shop) => {
        const newInvoice = new Invoice({
          account: accountId,
          shop: shop.shopId,
          receivedAddress,
        });
        
        let total = 0;
        shop.listProduct.forEach(prod => {
            const {title, price, image, variant, amount} = prod;
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
            listCartPromise.push(Cart.findOneAndDelete({_id: prod.cartId, account: accountId}));
            listUpdateProductPromise.push(
                Product.findByIdAndUpdate({ _id: prod.productId }, { $inc: {scoreView: 3, soldNumber: 1} }),
            )

            mailerListProduct += `<div style="display: flex; margin-bottom: 6px;">
                <div style="margin-right: 14px;">
                    <img src=${image} alt="product" width="80">
                </div>
                <div style="flex: 1">
                    <h5 style="margin: 0 0 8px; font-size: 16px; color: rgba(0,0,0,.8)">${title}</h5>
                    <span>Loại: ${variant ? `${variant.firstClassificationName}, ${variant.secondClassificationName}`: ""}</span>
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
        User.findOne({account: accountId}),
        Account.findById(accountId),
        Address.findOne({_id: receivedAddress, account: accountId}),
        ...listInvoiceDetailPromise, 
        ...listInvoicePromise, 
        ...listCartPromise,
        ...listUpdateProductPromise
      ]);

      

      const content = `<div style = "width: 600px; margin: 0 auto; font-size: 14px;">
          <div style="text-align: center">
              <img src="https://ci6.googleusercontent.com/proxy/pYFHITRPqvhJTw_S-07ijzWoaEBQAzRP2pEx0td9IIihdWyPRk-YTRHGwEkm3CIgZtGxN3yi13JhXCixF_4piF9xAjvOdFZqQX0jD1E=s0-d-e1-ft#https://cf.shopee.sg/file/0cd023d64f04491f3dc8076d6932dfdc" alt="" width="120">
          </div>
          <p>Cám ơn bạn <b>${user_db.fullName}</b> đã cho chúng tôi cơ hội phục vụ. Nhân viên sẽ liên hệ lại với quý khác để các nhận giao hàng chậm nhất 24h.</p>
          <div style="padding: .375rem .875rem; background-color: #f3f3f3; text-transform: uppercase">Thông tin đặt hàng</div>
          <div>
              <p><span>Họ Tên: </span> <b>${user_db.fullName}</b></p>
              <p><span>Địa chỉ: </span> <b>${address_db.houseNumber}, ${address_db.ward}, ${address_db.district}, ${address_db.province}</b></p>
              <p><span>Số điện thoại: </span> <b>(84+) ${address_db.phoneNumber}</b></p>
          </div>
          <p>Ghi chú: Đừng cho ai biết!</p>
          <div style="padding: .375rem .875rem; margin-bottom: 16px; background-color: #f3f3f3; text-transform: uppercase">Sản phẩm đã mua</div>
          ${mailerListProduct}
          <div style="padding: .375rem .875rem; margin: 16px 0; background-color: #f3f3f3; text-transform: uppercase">Tổng cộng</div>
          <div style="margin-bottom: 24px; text-align: right">
              <p>Tổng tiền: <b style="display: inline-block; min-width: 100px;">${totalPrice}đ</b></p>
              <p>Chi phí vận chuyển: <b style="display: inline-block; min-width: 100px;">38.000đ</b></p>
              <p>Tổng chi phí: <b style="display: inline-block; min-width: 100px;">${totalPrice + 38000}đ</b></p>
          </div>

          <p style="border-top: 2px solid #ee4d2d; padding-top: 16px;">Nhấn <a href="http://localhost:3000/verify-purchase/" style="text-decoration: none; color: #ee4d2d; font-size: 20px;">tại đây</a> để chúng tôi có thể xác nhận được thông tin đơn hàng của bạn!</p>
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
};
