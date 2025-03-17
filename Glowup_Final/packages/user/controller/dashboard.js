const { error, success } = require("../../../common/apiResponse/apiResponse");
const Order = require("../../orders/models/orderSchema");
const Product = require("../../inventory/models/inventorySchema");
const Error = require("../../../common/models/errorSchema");
const { getText } = require("../../../common/language/lang");

exports.getDashboardTotals = async (req, res) => {
  try {
    const products = await Product.find().select('name_en attributes');
    console.log("All", products);
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const totalOrders = await Order.countDocuments({ isDeleted: false });
    const totalCompletedOrders = await Order.countDocuments({
      status: "Completed",
      isDeleted: false
    });
    const totalActiveOrders = await Order.countDocuments({ status: "Active" });

    const totals = {
      totalProducts,
      totalOrders,
      totalCompletedOrders,
      totalActiveOrders,
    };

    res
      .status(200)
      .json(
        success(
          "Dashboard totals fetched successfully",
          { data: totals },
          res.statusCode,
        ),
      );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getOrderList = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, year, month } = req.body;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (year) {
      query.createdAt = {
        ...query.createdAt,
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year}-12-31`),
      };
    }

    if (month && year) {
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(`${year}-${month}-01`);
      endDate.setMonth(endDate.getMonth() + 1);
      query.createdAt = { ...query.createdAt, $gte: startDate, $lt: endDate };
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("user", "fullName") .populate({
        path: "inventory.product", 
        select: "name_en price imagesApp imagesWeb imagesOg",
      })
      
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(query);

    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json(
      success(
        "Order listing fetched successfully",
        {
          orders,
          pagination: {
            totalOrders,
            totalPages,
            currentPage: page,
            limit,
          },
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getProductList = async (req, res) => {
  try {
    const { search } = req.body;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)

      .select("imagesApp name_en")
      .lean();
    const productList = products.map((product) => ({
      ...product,
      revenue: 0,
      progress: 0,
    }));

    // const totalProducts = await Product.countDocuments(query);

    res.status(200).json(
      success(
        "Product listing fetched successfully",
        {
          data: {
            products: productList,
          },
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: JSON.stringify(err),
      objError: err,
      route: "category/addCategory",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
