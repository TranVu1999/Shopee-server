const url = require("url");
// Models
const Account = require("./../models/account");
const ProductCategory = require("./../models/product_category");
const Product = require("./../models/product");
const ProductSaveChange = require("./../models/product_save_change");
const Shop = require("./../models/shop");
const ProductKeyword = require("./../models/product_keyword");
//Modules
const Format = require("./../utils/format");
const Validate = require("./../utils/validate");
// helpers
const productKeywordHelper = require("./../helpers/product_keyword");

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
  console.log({ category });
  return listProduct.filter((prod) => {
    return (
      Format.removeAccents(
        Format.removeRedundantSpaceCharacter(prod.categories[0])
      ) === category
    );
  });
}

function getProductOfClothes(listProduct, filter, typeHuman) {
  let res = getListProductByCategory(listProduct, typeHuman);

  let lengthProduct = res.length;
  const {
    page,
    topCategory,
    deliveryAddress,
    brand,
    selectType,
    sort,
    from,
    to,
  } = filter;

  if (topCategory) {
    const temp = [];

    for (let i = 0; i < lengthProduct; i++) {
      const topCateProd = res[i].categories[res[i].categories.length - 1];
      let strFormatCategory = Format.removeAccents(topCateProd).replace(
        /\s+/g,
        ""
      );

      if (topCategory.replace(/-/g, "") === strFormatCategory) {
        temp.push(res[i]);
      }
    }

    res = temp;
  }

  if (deliveryAddress) {
    const temp = [];
    const lengthProduct = res.length;

    for (let i = 0; i < lengthProduct; i++) {
      const provinceDeliveryAddress = res[i].deliveryAddress.province;
      let strAddress = Format.removeAccents(provinceDeliveryAddress)
        .replace(/\s+/g, "")
        .toLowerCase();

      if (deliveryAddress.replace(/-/g, "") === strAddress) {
        temp.push(res[i]);
      }
    }

    res = temp;
  }

  if (brand) {
    const temp = [];
    const lengthProduct = res.length;

    for (let i = 0; i < lengthProduct; i++) {
      const prodBrand = res[i].optionalAttributes.brand;

      if (prodBrand) {
        let strBrand = Format.removeAccents(prodBrand)
          .replace(/\s+/g, "")
          .toLowerCase();

        if (strBrand === brand.replace(/-+/g, "")) {
          temp.push(res[i]);
        }
      }
    }

    res = temp;
  }

  return res;
}

const addNewProductKeyword = async (listKeyword, product) => {
  const listProdKeyword_db = await Promise.all(
    listKeyword.map((keyword) => ProductKeyword.findOne({ keyword }).lean())
  );

  const promises = [];
  listProdKeyword_db.forEach((prodKeyword_db, index) => {
    if (prodKeyword_db) {
      const isExist = prodKeyword_db.listProduct.some(
        (prod_db) => prod_db.productId === product.toString()
      );

      if (!isExist) {
        promises.push(
          ProductKeyword.findByIdAndUpdate(prodKeyword_db._id, {
            $push: { listProduct: { productId: product, score: 0 } },
          })
        );
      }
    } else {
      const newProductKeyword = new ProductKeyword({
        keyword: listKeyword[index],
        listProduct: { productId: product, score: 0 },
      });

      promises.push(newProductKeyword.save());
    }
  });

  await Promise.all(promises);
};

const getProductCategory = async (listProduct) => {
  const promise = [];
  listProduct.forEach((prod) => {
    const cate = prod.categories[prod.categories.length - 1];
    promise.push(ProductCategory.findOne({ title: cate }).lean());
  });

  let categories_db = await Promise.all(promise);

  const res = [];
  categories_db.forEach((cate_db) => {
    const isExist = res.some(
      (cate) => cate._id.toString() === cate_db._id.toString()
    );
    if (!isExist) {
      res.push({
        _id: cate_db._id,
        title: cate_db.title,
        alias: cate_db.alias,
      });
    }
  });

  return res;
};

const getProductDeliveryAddress = (listProduct) => {
  const res = [];
  listProduct.forEach((prod) => {
    const isExist = res.some(
      (address) => address === prod.deliveryAddress.province
    );

    if (!isExist) {
      res.push(prod.deliveryAddress.province);
    }
  });
  return res;
};

const filterProduct = (listProduct, filter, category = "") => {
  const {
    page,
    topCategory,
    deliveryAddress,
    brand,
    selectType,
    sort,
    from,
    to,
  } = filter;

  let res = {
    listProduct: [],
  };
  let amount = 0;

  listProduct.forEach((product) => {
    let flag = true;

    if (brand) {
      const productBrandFormatted = Format.removeAccents(
        product.optionalAttributes.brand
      )
        .toLowerCase()
        .replace(/\s/g, "");

      const brandFormatted = brand.replace(/-/g, "");

      if (productBrandFormatted !== brandFormatted) {
        flag = false;
      }
    }

    if (flag && deliveryAddress) {
      const productDeliveryAddressFormatted = Format.removeAccents(
        product.deliveryAddress.province
      )
        .toLowerCase()
        .replace(/\s+/g, "");

      const deliveryAddressFormatted = deliveryAddress.replace(/-+/g, "");

      if (productDeliveryAddressFormatted !== deliveryAddressFormatted) {
        flag = false;
      }
    }

    if (flag && topCategory) {
      const topCategoryFormatted = topCategory.replace(/-/g, "");
      const productCategory = Format.removeAccents(
        product.categories[product.categories.length - 1]
      )
        .toLowerCase()
        .replace(/\s/g, "");

      if (topCategoryFormatted !== productCategory) {
        flag = false;
      }
    }

    // check flag
    if (flag) {
      res.listProduct.push(product);
      amount++;
    }
  });

  return { ...res, amount };
};

const getOptionFilter = (listProduct) => {
  const res = {
    listBrand: [],
    listDeliveryAddresss: [],
    listCategory: [],
  };

  listProduct.forEach((product) => {
    const productBrand = product.optionalAttributes.brand;
    const isAcceptBrand = res.listBrand.some((brand) => productBrand === brand);
    if (!isAcceptBrand && productBrand) {
      res.listBrand.push(productBrand);
    }

    const productProvince = product.deliveryAddress.province;
    const isAcceptAddress = res.listDeliveryAddresss.some(
      (address) => address === productProvince
    );
    if (!isAcceptAddress) {
      res.listDeliveryAddresss.push(productProvince);
    }

    const productCategory = product.categories[product.categories.length - 1];
    const isAcceptCategory = res.listCategory.some(
      (cate) => cate === productCategory
    );
    if (!isAcceptCategory) {
      res.listCategory.push(productCategory);
    }
  });

  return res;
};

const getRelevantProduct = async listKeyword => {
  let relevantProducts = [];
  listKeyword.forEach(keyword => {
    keyword.listProduct.forEach(product => {
      const isExist = relevantProducts.some(relProduct => relProduct.productId === product.productId);
      if(!isExist) {
        relevantProducts.push(product);
      }
    })
  });

  relevantProducts = relevantProducts.slice(0, 5).sort((a, b) => b.score - a.score);

  const promises = [];
  relevantProducts.forEach(product => {
    promises.push(Product.findById(product.productId).lean().populate('deliveryAddress'))
  })

  const res = await Promise.all(promises);
  return res;
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
      deliveryAddress,
    } = req.body;

    try {
      const [account_db, shop_db] = await Promise.all([
        Account.findById(accountId),
        Shop.findOne({ account: accountId }),
      ]);

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
        shop: shop_db._id,
        deliveryAddress,
      });
      const newProductSaveChange = new ProductSaveChange({
        title: fm_title,
        price,
        listPrice,
        classification,
        modifiedBy: accountId,
      });

      await Promise.all([
        newProduct.save(),
        newProductSaveChange.save(),
        addNewProductKeyword([...categories, title], newProduct._id),
      ]);

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
   * Get list products
   */
  filter: async function (req, res) {
    var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    const q = url.parse(fullUrl, true);
    const qdata = q.query;
    const { category, search } = qdata;

    try {
      const listProduct_db = await Product.find({ status: true })
        .sort({ scoreView: -1 })
        .populate("deliveryAddress")
        .lean();

      let listProduct = [];
      let categories = [];
      let deliveryAddresses = [];
      let resProduct = null;

      if (category) {
        switch (category) {
          case "thoi-trang-nu":
          case "thoi-trang-nam":
            listProduct = getListProductByCategory(listProduct_db, category);
            resProduct = filterProduct(listProduct, qdata);
            resProduct = {
              ...resProduct,
              ...getOptionFilter(listProduct),
            };

          default:
            break;
        }
      } else if (search) {
        const listProductKey_db = await ProductKeyword.find().lean();

        const bestKeywordMatched = listProductKey_db.find((keyword) => {
          const keywordFormatted = Format.removeAccents(keyword.keyword)
            .toLowerCase()
            .replace(/\s/g, "");
          const keysearchFormatted = search.replace(/-/g, "");
          return keywordFormatted === keysearchFormatted;
        });

        const listProductMatched = bestKeywordMatched.listProduct
          .sort((a, b) => b.score - a.score)
          .map((prod) => prod.productId);

        const promisesProduct = [];
        listProductMatched.forEach((prodId) => {
          promisesProduct.push(
            Product.findById(prodId).lean().populate("deliveryAddress")
          );
        });

        const response = await Promise.all([
          ...promisesProduct,
          ProductKeyword.findOneAndUpdate(
            { keyword: bestKeywordMatched.keyword },
            { $inc: { scoreView: 1 } }
          ),
        ]);

        response.pop();

        resProduct = filterProduct(response, qdata);
        resProduct = {
          ...resProduct,
          ...getOptionFilter(response),
        };
      }

      return res.json({
        success: true,
        message: "Dữ liệu được cập nhật",
        // listProduct,
        // categories,
        // deliveryAddresses
        data: resProduct,
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
   * Get list product's delivery address
   */
  getListDeliveryAddress: async function (req, res) {
    const { rootCategoryId } = req.params;

    try {
      const rootCategory = await ProductCategory.findById(
        rootCategoryId
      ).lean();

      console.log({ rootCategory });

      const listProduct_db = await Product.find({
        status: true,
        categories: rootCategory.title,
      })
        .sort({ scoreView: -1 })
        .populate("deliveryAddress")
        .lean();

      let listAddress = [];

      listAddress = [
        ...new Set(
          listProduct_db.map((prod_db) => prod_db.deliveryAddress.province)
        ),
      ];

      return res.json({
        success: true,
        message: "Dữ liệu được cập nhật",
        listAddress,
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
   * Get list product's brand
   */
  getListBrand: async function (req, res) {
    const { rootCategoryId } = req.params;

    try {
      const rootCategory = await ProductCategory.findById(
        rootCategoryId
      ).lean();

      const listProduct_db = await Product.find({
        status: true,
        categories: rootCategory.title,
      })
        .sort({ scoreView: -1 })
        .populate("deliveryAddress")
        .lean();

      const listBrand = [
        ...new Set(
          listProduct_db.map((prod_db) => prod_db.optionalAttributes.brand)
        ),
      ];

      return res.json({
        success: true,
        message: "Dữ liệu được cập nhật",
        listBrand: listBrand.filter((brand) => brand),
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
   * Get product detail
   */
  getDetail: async function (req, res) {
    const { id } = req.params;

    try {
      const [product_db, , listKeyword_db] = await Promise.all([
        Product.findOne({ _id: id, status: true })
          .lean()
          .populate({
            path: "shop",
            select: "avatar brand alias listTracker createdDate",
            populate: {
              path: "account",
              select: "role",
            },
          }),
        Product.findOneAndUpdate(
          { _id: id },
          { $inc: { viewedNumber: 1, scoreView: 1 } }
        ),
        ProductKeyword.find({ 'listProduct.productId': id}),
      ]);
      

      const [amountProduct, listProductOfStore, listRelevantProduct] = await Promise.all([
        Product.countDocuments({ shop: product_db.shop }),
        Product.find({ shop: product_db.shop }).sort("soldNumber").limit(5), // lấy top 5 sản phẩm bán chạy nhất
        getRelevantProduct(listKeyword_db)
      ]);

      const store = {
        _id: product_db.shop._id,
        brand: product_db.shop.brand,
        alias: product_db.shop.alias,
        avatar: product_db.shop.avatar,
        type: product_db.shop.account.role,
        rating: 0,
        amountProduct,
        amountTracker: product_db.shop.listTracker.length,
        createdDate: product_db.shop.createdDate,
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
          data: {
            product,
            listRelevantProduct
          }
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
