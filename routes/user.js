var express = require("express");
var router = express.Router();
const passport = require("passport");
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { validateUser, isAdmin } = require("../middleware");

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
  catchAsync(async (req, res) => {
    const { email, username, password, apisecret, apikey, role, standard } =
      req.body;
    //new user commmon details
    let user = new User({
      email,
      username,
      apisecret,
      apikey,
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
            waiting_room: true,
          },
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      //classroom details for teacher
      user.classroom = {
        id: classroom.data.id,
        pwd: classroom.data.password,
        url: classroom.data.join_url,
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

module.exports = router;
