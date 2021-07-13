var express = require("express");
var router = express.Router();
const passport = require("passport");
const axios = require("axios");
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Class = require("../models/class");
const jwt = require("jsonwebtoken");
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/user/dashboard",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

router.post("/register", ensureAuthenticated, isAdmin, (req, res, next) => {
  const { username, email, password, role, apikey, apisecret } = req.body;

  if (!username || !email || !password || !role || !apisecret || !apikey) {
    req.flash("error_alert", "Please fill in all the fields");
    res.redirect("/user/dashboard");
    return;
  }

  User.findOne({ username }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash("error_alert", "User with username already exist");
      res.redirect("/user/dashboard");
    } else {
      const newUser = new User({
        username,
        email,
        password,
        role,
        apikey,
        apisecret,
      });

      //hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          //save hash to pass
          newUser.password = hash;
          //save user
          newUser
            .save()
            .then((value) => {
              req.flash("success_alert", "New user registered");
              res.redirect("/user/dashboard");
            })
            .catch((value) => console.log(value));
        });
      });
    }
  });
});
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  if (req.user.role !== "admin") {
    User.findById(req.user._id)
      .populate("classes")
      .populate("teacher", "username")
      .exec((err, user) => {
        if (err) {
          console.log(err);
          return;
        }
        res.render("dashboard", { user });
      });
  } else {
    Class.find({})
      .populate("teacher")
      .exec((err, classes) => {
        if (err) {
          console.log(err);
          return;
        }
        const user = req.user;
        res.render("dashboard", { user, classes });
      });
  }
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_alert", "Now logged out");
  res.redirect("/user/login");
});

router.get("/passchange", ensureAuthenticated, (req, res) => {
  res.render("passchange");
});

router.put("/passchange", ensureAuthenticated, async (req, res) => {
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
      const hash = await bcrypt.hash(pass, 10);
      user.password = hash;
      await user.save();
      req.flash("success_alert", "Password successfully updated.");
      res.redirect("/user/dashboard");
    } catch (error) {
      console.log(error);
    }
  }
});

router.get("/create", ensureAuthenticated, isTeacher, (req, res) => {
  const students = req.students;
  res.json({ students });
});
router.post("/create", ensureAuthenticated, isTeacher, (req, res, next) => {
  const { title, student } = req.body;
  console.log(student);
  const user = req.user;
  //jwt token created
  jwt.sign(
    { aud: null, iss: user.apikey },
    user.apisecret,
    { algorithm: "HS256", expiresIn: 60 * 5 },
    (err, token) => {
      if (err) {
        console.log("err generating token");
        return;
      }
      //new recurring meeting created
      axios({
        method: "post",
        url: "https://api.zoom.us/v2/users/me/meetings",
        data: {
          topic: title,
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
      })
        .then((meeting) => {
          const newCourse = new Class({
            title: title,
            students: student,
            teacher: req.user._id,
            meetingId: meeting.data.id,
            meetingPwd: meeting.data.password,
            joinUrl: meeting.data.join_url,
          });

          newCourse
            .save()
            .then((course) => {
              const { students } = course;
              //the class created is added into enrolled student's
              students.forEach((studentId) => {
                User.findById(studentId, (err, student) => {
                  if (err) {
                    console.log(err);
                    return;
                  }
                  student.classes.push(course.id);
                  student
                    .save()
                    .then((s) => s)
                    .catch((e) => console.log(e));
                });
              });
              User.findById(req.user.id, (err, teacher) => {
                if (err) {
                  console.log(err);
                  return;
                }
                teacher.classes.push(course.id);
                teacher
                  .save()
                  .then((t) => {
                    req.flash("success_alert", "Class created");
                    res.redirect("/user/dashboard");
                  })
                  .catch((e) => console.log(e));
              });
            })
            .catch((err) => {
              console.log(err);
              return;
            });
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    }
  );
});

router.get("/class/:classId", ensureAuthenticated, (req, res) => {
  const { classId } = req.params;
  Class.findById(classId).exec((err, course) => {
    if (err) {
      console.log(err);
      return;
    }
    const { meetingId, meetingPwd, title } = course;
    const role =
      req.user.role === "teacher" || req.user.role === "admin" ? 1 : 0;
    const { username } = req.user;
    res.render("class", {
      layout: false,
      meetingId,
      meetingPwd,
      role,
      username,
      title,
    });
  });
});

function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    req.flash("error_alert", "Not allowed");
    return res.redirect("/dashboard");
  }
  next();
}
function isTeacher(req, res, next) {
  if (req.user.role !== "teacher") {
    req.flash("error_alert", "Not allowed");
    return res.redirect("/dashboard");
  }
  User.find({ role: "student" }, (err, students) => {
    if (err) {
      console.log(err);
      return;
    }
    req.students = students;
    next();
  });
}

module.exports = router;
