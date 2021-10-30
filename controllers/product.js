// Models
const Account = require("./../models/account");
const ProductCategory = require("./../models/product_category");
const Product = require("./../models/product");
const ProductSaveChange = require("./../models/product_save_change");

//Modules
const Format = require("./../utils/format");
const Validate = require("./../utils/validate");

const handleExceptFromSystem = (err, res) => {
  console.log(err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

function showText(path) {
  function showValue(line, value) {
    return `\npath: ${path}; line ${line}: \n${value}`;
  }

  return showValue;
}

// return true if any property is unvalidated
async function validateProductInformation(
  title,
  avatar,
  categories,
  description,
  price
) {
  let res = title && avatar && description && price && categories.length;

  const categories_db = await ProductCategory.find().lean();

  for (let cat of categories) {
    res = categories_db.some((cat_db) => cat_db.title === cat);

    if (!res) {
      break;
    }
  }

  return !res;
}

module.exports = {
  /**
   * Add new product category
   */
  add: async function (req, res) {
    const { accountId, role } = req;
    const {
      title,
      avatar,
      video,
      categories,
      classification,
      description,
      images,
      listPrice,
      optionalAttributes,
      price,
      unused,
      sku,
    } = req.body;

    const showValue = new showText("controllers/product");
    console.log(showValue(72, images));
    console.log(req.body)

    try {
      const account_db = await Account.findById(accountId);

      if (!account_db && (role === "owner" || role === "admin")) {
        return res.status(400).json({
          success: false,
          message: "Bạn không có quyền thực hiện thao tác này.",
        });
      }

      const isAccept = await validateProductInformation(
        title,
        avatar,
        categories,
        description,
        price
      );

      if (isAccept) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu của bạn không hợp lệ.",
        });
      }

      const fm_title = title.toLowerCase().replace(/\s+/g, " ").trim();

      const newProduct = new Product({
        title: fm_title,
        alias: Format.alias(fm_title),
        video,
        avatar,
        categories,
        description,
        optionalAttributes,
        images,
        price,
        listPrice,
        classification,
        unused,
        sku,
        account: accountId,
      });
      const newProductSaveChange = new ProductSaveChange({
        title: fm_title,
        price,
        listPrice,
        classification,
        modifiedBy: accountId,
      });

      await Promise.all([newProduct.save(), newProductSaveChange.save()]);

      return res.json({
        success: true,
        message: "Dữ liệu được cập nhật",
        product: newProduct,
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
