// Models
const Shop = require("./../models/shop");
const Account = require("./../models/account");
const User = require("./../models/user");

// Module
const Format = require("./../utils/format");
const Validate = require("./../utils/validate");

module.exports = {
  /**
   * Get information of shop
   */
  getInformation: async function (req, res) {
    const { accountId, role } = req;

    try {
      if (role === "owner" || role === "admin") {
        const filter = { account: accountId };

        const shop_db = await Shop.findOne(filter);
        const user_db = await User.findOne(filter);
        console.log({ shop_db });
        return res.json({
          success: true,
          message: "You can get this data",
          shop: {
            _id: shop_db._id,
            avatar: shop_db.avatar,
            username: user_db.username,
            backgroundImage: shop_db.backgroundImage,
            createdDate: shop_db.createdDate,
            brand: shop_db.brand,
            images: shop_db.images,
            description: shop_db.description,
            analysis: {
              numberProduct: 0,
              ratioReplay: 57,
              rangeReplay: "Trong vòng vài tiếng",
              rating: 0,
              ratioInvoice: 0,
            },
          },
        });
      }

      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin",
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
   * Put information of shop
   */
  updateInformation: async function (req, res) {
    const { accountId, role } = req;
    const { id } = req.params;
    let { avatar, backgroundImage, description, brand, images } = req.body;

    try {
      if (role === "owner" || role === "admin") {
        const fm_brand = brand.replace(/\s+/g, " ").trim();

        const duplicateShops = await Shop.find({ brand: fm_brand }).lean();

        let countDuplicate = 0;
        for (let shopItem of duplicateShops) {
          if (shopItem.account.toString() !== accountId) {
            countDuplicate++;
          }
        }

        if (countDuplicate === 0) {
          const fm_alias = Format.removeRedundantSpaceCharacter(
            Format.removeSpecialCharacer(Format.removeAccents(fm_brand))
          );

          const updateData = {
            brand: fm_brand,
            alias: fm_alias,
            backgroundImage,
            images,
            avatar,
            description,
          };

          const updateShop = await Shop.findOneAndUpdate(
            { account: accountId, _id: id },
            updateData,
            { new: true }
          );

          if (updateShop) {
            return res.json({
              success: true,
              message: "Thành công",
              shop: updateShop,
            });
          }
        }

        return res.status(401).json({
          success: false,
          message: "Nhãn hàng này đã tồn tại",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này",
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
