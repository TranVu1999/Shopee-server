// Models
const Account = require("./../models/account");
const Invoice = require("./../models/invoice");
const InvoiceDetail = require("./../models/invoice_detail");

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
      const account_db = await Account.findById(accountId);

      const listInvoicePromise = [];
      const listInvoiceDetailPromise = [];

      listShop.forEach((shop) => {
        const newInvoice = new Invoice({
          account: accountId,
          shop: shopId,
          receivedAddress,
        });
        listInvoicePromise.push(newInvoice);

        shop.listProduct.forEach(prod => {
            const newInvoiceDetail = new InvoiceDetail({
                invoice: newInvoice._id,
                product: prod.productId,
                amount: prod.amount

            });
            listInvoiceDetailPromise.push(newInvoiceDetail);
        })
      });

      

      const content = `<div style = "width: 560px; margin: 0 auto; font-size: 14px;">
            <div style="text-align: center">
                <img src="https://ci6.googleusercontent.com/proxy/pYFHITRPqvhJTw_S-07ijzWoaEBQAzRP2pEx0td9IIihdWyPRk-YTRHGwEkm3CIgZtGxN3yi13JhXCixF_4piF9xAjvOdFZqQX0jD1E=s0-d-e1-ft#https://cf.shopee.sg/file/0cd023d64f04491f3dc8076d6932dfdc" alt="" width="120">
            </div>
            <div>
                <p>Xin chào Tran Le Anh Vu!</p>
                <p>Chúng tôi nhận được yêu cầu đặt hàng cho tài khoản shopee của bạn.</p>
                <p>Nhấn <a href="http://localhost:3000/verify-purchase/" style="text-decoration: none; color: #ee4d2d;">tại đây</a> để chúng tôi có thể xác nhận được thông tin đơn hàng của bạn!</p>
                <p>Đường link này chỉ tôn tại trong vòng 24h.</p>
                <p>Hóa đơn này sẽ bị hủy trong vòng 24h nếu bạn không xác nhận.</p>
                <br>
                <p>Trân trọng,</p>
                <p>Đội ngũ Shopee</p>
            </div>
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
