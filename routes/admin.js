var express = require("express");
var router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Application = require("../models/application");
const { ensureAuthenticated } = require("../middleware");
router.get(
  "/applications",
  catchAsync(async (req, res, next) => {
    const allApplications = await Application.find().sort({ _id: -1 });
    res.render("applications", { layout: "dlayout", allApplications });
  })
);
router.post(
  "/accept",
  catchAsync(async (req, res) => {})
);
module.exports = router;
