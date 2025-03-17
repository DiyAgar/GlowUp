const Content = require("../models/contentSchema");
const { error, success } = require("../../../common/apiResponse/apiResponse");
const { getText } = require("../../../common/language/lang");

exports.addContent = async (req, res) => {
  try {
    const { title_en, title_ar, contents_en, contents_ar, type } = req.body;
    if (!type) {
      return res
        .status(201)
        .json(error("Please provide type ", res.statusCode));
    }
    if (!title_en) {
      return res
        .status(201)
        .json(error("Please provide english title", res.statusCode));
    }
    if (!title_ar) {
      return res
        .status(201)
        .json(error("Please provide arabic title", res.statusCode));
    }
    if (!contents_en) {
      return res
        .status(201)
        .json(error("Please provide english content", res.statusCode));
    }
    if (!contents_ar) {
      return res
        .status(201)
        .json(error("Please provide arabic content", res.statusCode));
    }
    const content = new Content({
      type: type,
      title_ar: title_ar,
      title_en: title_en,
      contents_ar: contents_ar,
      contents_en: contents_en,
    });
    await content.save();
    res.status(201).json(success("Content added", { content }, res.statusCode));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getContent = async (req, res) => {
  try {
    const { type } = req.body;
    const content = await Content.find(type ? { type: type } : {});
    res.status(200).json(success("Success", { content }, res.statusCode));
  } catch (err) {
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.contentDelete = async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.status(200).json(success("Content deleted", {}, res.statusCode));
  } catch (err) {
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.editContent = async (req, res) => {
  try {
    const { title_en, title_ar, contents_en, contents_ar, type } = req.body;

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json(error("Content not found", res.statusCode));
    }

    if (type) content.type = type;
    if (title_en) content.title_en = title_en;
    if (title_ar) content.title_ar = title_ar;
    if (contents_en) content.contents_en = contents_en;
    if (contents_ar) content.contents_ar = contents_ar;

    // Save the updated content
    await content.save();
    res
      .status(200)
      .json(
        success("Content updated successfully", { content }, res.statusCode),
      );
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};

exports.getUserContent = async (req, res) => {
  try {
    const { type } = req.body;
    const content = await Content.find(type ? { type: type } : {});
    res.status(200).json(success("Success", { content }, res.statusCode));
  } catch (err) {
    res
      .status(500)
      .json(error(getText("SERVER_ERROR", req.language), res.statusCode));
  }
};
