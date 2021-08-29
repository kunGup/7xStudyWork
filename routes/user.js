var express = require("express");
var router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const Application = require("../models/application");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const multer = require("multer");
var generatePassword = require("password-generator");
const { validateUser, isAdmin, ensureAuthenticated } = require("../middleware");

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

router.post(
  "/register",
  ensureAuthenticated,
  isAdmin,
  validateUser,
  catchAsync(async (req, res) => {
    const {
      fullname,
      username,
      email,
      password,
      apisecret,
      apikey,
      role,
      standard,
    } = req.body;
    //new user commmon details
    let user = new User({
      fullname,
      username,
      email,
      role,
    });
    if (role === "teacher") {
      const token = jwt.sign({ aud: null, iss: apikey }, apisecret, {
        algorithm: "HS256",
        expiresIn: 60 * 5,
      });

      const classroom = await axios({
        method: "post",
        url: "https://api.zoom.us/v2/users/me/meetings",
        data: {
          topic: "7x Study classroom",
          type: 3,
          settings: {
            host_video: false,
            participant_video: false,
            in_meeting: false,
            mute_upon_entry: true,
            audio: "voip",
            join_before_host: false,
            alternative_hosts: "kumar.laltesh@gmail.com",
          },
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      user.apikey = apikey;
      user.apisecret = apisecret;
      //classroom details for teacher
      user.classroom = {
        id: classroom.data.id,
        pwd: classroom.data.password,
        join_url: classroom.data.join_url,
        start_url: classroom.data.start_url,
      };
    } else if (role === "student") {
      //for student
      user.class = standard;
    }

    await User.register(user, password);
    req.flash("success_alert", "New user created successfully!");
    res.redirect("/dashboard");
  })
);

//Configuration for Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `files/${file.fieldname}-${Date.now()}.${ext}`);
  },
});

// Multer Filter
const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.split("/")[1] === "pdf" ||
    file.mimetype.split("/")[1] === "doc" ||
    file.mimetype.split("/")[1] === "docx"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF or Word File!!"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

let data = require("../public/js/teacherApply");
router.get("/apply", (req, res) => {
  res.render("teacherApply", { data });
});

//new teacher apply route
router.post(
  "/apply",
  upload.single("resume"),
  catchAsync(async (req, res) => {
    const application = new Application(req.body);
    application.resumeName = req.file.filename;

    //inserting batch objects after mapping from req.body.batch
    let batches = req.body.batch;
    batches = [].concat(batches);
    application.batches = batches.map((batch) => {
      var obj = {};
      obj.name = batch;
      if (obj.name === "1to1") {
        obj.minCharges = req.body.onetooneprice;
      } else if (obj.name === "1to2") {
        obj.minCharges = req.body.onetotwoprice;
      } else {
        obj.minCharges = req.body.shortprice;
      }
      return obj;
    });
    await application.save();
    req.flash(
      "success_alert",
      "Your application has been submitted successfully."
    );
    res.redirect("back");
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_alert", "Now logged out");
  res.redirect("/user/login");
});

router.get("/passchange", ensureAuthenticated, (req, res) => {
  res.render("passchange");
});

router.put(
  "/passchange",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    const { pass, pass2 } = req.body;
    let errors = [];
    if (pass.length < 8) {
      errors.push({ msg: "Password should atleast 8 characters" });
    }
    if (pass !== pass2) {
      errors.push({ msg: "Passwords don't match" });
    }

    if (errors.length > 0) {
      res.render("passchange", {
        errors,
      });
    } else {
      try {
        const user = await User.findById(req.user._id);
        await user.setPassword(pass);
        await user.save();
        req.flash("success_alert", "Password successfully updated.");
        res.redirect("/dashboard");
      } catch (e) {
        req.flash("error", e.message);
        res.redirect("/user/passchange");
      }
    }
  })
);

router.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  console.log(err);
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  req.flash("error_alert", err.message);
  res.redirect("back");
});

module.exports = router;
