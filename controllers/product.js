const url = require("url");

// Models
const Account = require("./../models/account");
const ProductCategory = require("./../models/product_category");
const Product = require("./../models/product");
const ProductSaveChange = require("./../models/product_save_change");
const Shop = require("./../models/shop");

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

function getListProductByCategory(listProduct, category) {
  return listProduct.filter((prod) => {
    return (
      Format.removeAccents(
        Format.removeRedundantSpaceCharacter(prod.categories[0])
      ) === category
    );
  });
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
      const fm_alias = Format.removeRedundantSpaceCharacter(
        Format.removeSpecialCharacer(Format.removeAccents(fm_title))
      );

      const newProduct = new Product({
        title: fm_title,
        alias: fm_alias,
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

  /**
   * Add new product category
   */
  filter: async function (req, res) {
    var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    const q = url.parse(fullUrl, true);
    const qdata = q.query;
    const { type, page } = qdata;

    try {
      const listProduct_db = await Product.find({ status: true }).lean();
      console.log(listProduct_db);


      let listProduct = [];

      switch (type) {
        case "category":
          const { category } = qdata;
          listProduct = getListProductByCategory(listProduct_db, category);
          break;
        default:
          listProduct = listProduct_db;
          break;
      }

      return res.json({
        success: true,
        message: "Dữ liệu được cập nhật",
        listProduct,
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
   * Add new product category
   */
  getDetail: async function (req, res) {
    const { id } = req.params;

    try {
      const [product_db] = await Promise.all([
        Product.findOne({ _id: id, status: true }).lean(),
        Product.findOneAndUpdate({ _id: id }, { $inc: { viewedNumber: 1 } }),
      ]);

      const filterByAccount = { account: product_db.account };

      const [shop_db, account_db, amountProduct, listProductOfStore] = await Promise.all([
        Shop.findOne(filterByAccount).lean(),
        Account.findById(product_db.account),
        Product.countDocuments(filterByAccount),
        Product.find(filterByAccount).sort("soldNumber").limit(5),
      ]);

      const store = {
        _id: shop_db._id,
        brand: shop_db.brand,
        alias: shop_db.alias,
        avatar: shop_db.avatar,
        type: account_db.role,
        rating: 0,
        amountProduct,
        amountTracker: shop_db.listTracker.length,
        createdDate: shop_db.createdDate,
        responseRate: 100,
        responseTime: "trong vài giờ",
      };

      const product = {
        ...product_db,
        categories: [...product_db.categories, product_db.title],
        store,
        listProductOfStore,
      };

      if (product_db) {
        return res.json({
          success: true,
          message: "Lấy dữ liệu thành công",
          product,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Không có dữ liệu trùng khớp",
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
