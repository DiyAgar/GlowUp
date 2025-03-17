const { success, error } = require("common/apiResponse/apiResponse");
const Value = require("../models/valuesSchema");
const Error = require("common/models/errorSchema");
const Attribute = require("../models/attributesSchema");

exports.addValue = async (req, res) => {
  try {
    const { name_en, name_ar, attribute } = req.body;
    if (!name_en) {
      return res
        .status(200)
        .json(error("Please provide english name", res.statusCode));
    }
    // const attributeId = await Attribute.findById(attribute);
    if (!attribute) {
      return res
        .status(200)
        .json(error("Please provide attribute", res.statusCode));
    }
    const verify = await Value.findOne({ name_en: name_en?.trim() });
    if (verify) {
      return res
        .status(201)
        .json(error("Values name already stored", res.statusCode));
    }
    const values = await Value.create({
      name_en: name_en?.trim(),
      name_ar: name_ar?.trim(),
      attribute: attribute,
    });

    res
      .status(200)
      .json(success("Attributes added", { values }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/addValue",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.getValues = async (req, res) => {
  try {
    const { search, page = 1, pageSize = 10 } = req.body;
    const values = await Value.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $match: {
          isDeleted: false,
          $or: [{ name_en: { $regex: search, $options: "i" } }],
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          values: [
            { $skip: +pageSize * (+page - 1) },
            { $limit: +pageSize },

            {
              $lookup: {
                localField: "attribute",
                foreignField: "_id",
                from: "attributes",
                as: "attribute",
                pipeline: [{ $project: { name_en: 1, name_ar: 1 } }],
              },
            },
            { $unwind: "$attribute" },
          ],
        },
      },
    ]);
    const total = values[0].metadata.length ? values[0].metadata[0].total : 0;
    res.status(200).json(
      success(
        "Values list",
        {
          total,
          totalPage: Math.ceil(+total / +pageSize),
          page,
          pageSize,
          values: +total ? values[0].values : [],
        },
        res.statusCode,
      ),
    );
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/getValues",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
exports.editValue = async (req, res) => {
  try {
    const { name_en, name_ar, attribute } = req.body;
    const values = await Value.findById(req.params.id);
    if (!values) {
      return res.status(200).json(error("Invalid value id", res.statusCode));
    }
    if (name_en) {
      values.name_en = name_en;
    }
    if (name_ar) {
      values.name_ar = name_ar;
    }
    if (attribute) {
      // const attributeId = await Attribute.findById(attribute);
      // if (!attributeId) {
      //   return res
      //     .status(200)
      //     .json(error("Invalid attribute id", res.statusCode));
      // }
      values.attribute = attribute;
    }
    await values.save();
    res
      .status(200)
      .json(success("Value edited", { value: values }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/editValues/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
exports.viewValue = async (req, res) => {
  try {
    const value = await Value.findById(req.params.id)
      .populate({
        path: "attribute",
        select: "name_en name_ar",
      })
      .lean();
    res.status(200).json(success("Values details", { value }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/viewValues/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.deleteValue = async (req, res) => {
  try {
    const values = await Value.findById(req.params.id);
    if (!values) {
      return res.status(200).json(error("Invalid value id", res.statusCode));
    }
    await Value.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json(success("Value deleted", {}, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/deleteValues/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.changeValueStatus = async (req, res) => {
  try {
    const values = await Value.findById(req.params.id).select("status");
    values.status = !values.status;
    await values.save();
    const msg = values.status ? "Value Enabled" : "Value Disabled";
    res.status(201).json(success(msg, { value: values }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/changeValueStatus/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};

exports.valuesDropdown = async (req, res) => {
  try {
    const { attribute = [] } = req.body;
    if (!attribute.length) {
      return res
        .status(206)
        .json(error("Please provide attribute", res.statusCode));
    }
    const values = await Value.find({
      isDeleted: false,
      attribute: { $in: attribute },
    })
      .sort({ createdAt: -1 })
      .select(["name_en", "name_ar"]);
    res.status(201).json(success("Values", { value: values }, res.statusCode));
  } catch (err) {
    console.log(err);
    await Error.create({
      // admin:admin,
      arrError: err,
      strError: err,
      objError: err,
      route: "category/valuesDropdown/:id",
    });
    res.status(500).json(error("Internal Server Error", res.statusCode));
  }
};
