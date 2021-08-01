var express = require("express");
var router = express.Router();
const axios = require("axios");
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/user");
const Class = require("../models/class");
const Review = require("../models/review");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
var moment = require("moment");
const {
  validateClass,
  validateClassUpdate,
  validateChangeTeacher,
  validateReview,
  isAdmin,
  isTeacher,
  isNotStudent,
} = require("../middleware");

//show dashboard
router.get(
  "/",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    res.render("dashboard", { layout: "dlayout" });
  })
);

//get teacher info
router.get(
  "/teacher/:teacherId",
  ensureAuthenticated,
  isNotStudent,
  catchAsync(async (req, res) => {
    let teacher = await User.findById(req.params.teacherId);
    res.render("teacher", { layout: "dlayout", teacher });
  })
);

//get classes of teacher
router.get(
  "/teacher/:teacherId/classes",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    let classes = await Class.find({ teacher: req.params.teacherId });
    res.json({ classes });
  })
);

//get classes
router.get(
  "/classes",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    let classes = [];
    if (req.user.role === "student") {
      classes = await Class.find({ students: req.user.id }).populate("teacher");
    } else if (req.user.role === "teacher") {
      classes = await Class.find({ teacher: req.user.id }).populate("teacher");
    } else {
      classes = await Class.find({}).populate("teacher");
    }
    res.json({ classes });
  })
);

//show class info
router.get(
  "/class/:classId",
  ensureAuthenticated,

  catchAsync(async (req, res) => {
    const { classId } = req.params;
    const cls = await Class.findById(classId)
      .populate("students")
      .populate("teacher")
      .populate({
        path: "reviews",
        populate: {
          path: "student",
        },
      });
    var dt = new Date(cls.when);
    let info = {
      date: `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`,
      time: `${format(dt.getHours())}:${format(dt.getMinutes())}`,
    };
    function format(num) {
      return num < 10 ? "0" + num : num;
    }
    res.render("class", {
      layout: "dlayout",
      cls,
      info,
    });
  })
);

//create new class
router.post(
  "/class",
  ensureAuthenticated,
  validateClass,
  catchAsync(async (req, res, next) => {
    const {
      title,
      student,
      subject,
      hrs,
      mins,
      standard,
      isRecurring,
      occurences,
      days,
      time,
      date,
      A,
    } = req.body;
    var convertedTime = moment(`${time} ${A}`, "hh:mm A").format("HH:mm");
    var convertedWhen = new Date(`${date}T${convertedTime}`);
    await createClass(convertedWhen);
    if (isRecurring === "true") {
      for (var i = 2; i <= parseInt(occurences); i++) {
        convertedWhen.setDate(convertedWhen.getDate() + parseInt(days));
        await createClass(convertedWhen);
      }
    }
    async function createClass(when) {
      const newClass = new Class({
        title,
        subject,
        students: student,
        teacher: req.user._id,
        class: standard,
        duration: { hrs, mins },
        when,
      });
      await newClass.save();
    }
    req.flash("success_alert", "New class created");
    res.redirect("/dashboard");
  })
);

//update classInfo - will include teacher change by admin
router.put(
  "/class/:classId",
  ensureAuthenticated,
  validateClassUpdate,
  catchAsync(async (req, res, next) => {
    const { classId } = req.params;
    const { title, subject, hrs, mins, time, date, A, completed } = req.body;
    var convertedTime = moment(`${time} ${A}`, "hh:mm A").format("HH:mm");
    var when = new Date(`${date}T${convertedTime}`);
    await Class.findByIdAndUpdate(classId, {
      title,
      subject,
      duration: { hrs, mins },
      when,
      completed,
    });
    req.flash("success_alert", "Class updated successfully");
    res.redirect(`/dashboard/class/${classId}`);
  })
);
//cancel class
router.delete(
  "/class/:classId",
  ensureAuthenticated,
  catchAsync(async (req, res, next) => {
    const { classId } = req.params;
    await Class.findByIdAndDelete(classId);
    req.flash("success_alert", "Class cancelled successfully");
    res.redirect(`/dashboard`);
  })
);

//change teacher by admin
router.put(
  "/class/:classId/changeTeacher",
  ensureAuthenticated,
  validateChangeTeacher,
  catchAsync(async (req, res) => {
    const { classId } = req.params;
    await Class.findByIdAndUpdate(classId, { teacher: req.body.teacher });
    req.flash("success_alert", "Teacher changed successfully");
    res.redirect(`/dashboard/class/${classId}`);
  })
);

//update attendance

//post review
router.post(
  "/class/:classId/review",
  ensureAuthenticated,
  validateReview,
  catchAsync(async (req, res) => {
    const cls = await Class.findById(req.params.classId);
    const { rating, body } = req.body;
    const review = new Review({ rating, body });
    review.student = req.user._id;
    cls.reviews.push(review);
    await review.save();
    await cls.save();
    req.flash("success", "Created new review!");
    res.redirect(`/dashboard/class/${cls._id}`);
  })
);
//delete review
router.delete(
  "/class/:classId/review/:reviewId",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    const { classId, reviewId } = req.params;
    await Class.findByIdAndUpdate(classId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/dashboard/class/${classId}`);
  })
);
//class meeting room
router.get(
  "/classroom/:classId",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    const { classId } = req.params;
    const cls = await Class.findById(classId).populate("teacher");
    const { id, pwd } = cls.teacher.classroom;
    const role =
      req.user.role === "teacher" || req.user.role === "admin" ? 1 : 0;
    res.render("classroom", {
      layout: false,
      meetingId: id,
      meetingPwd: pwd,
      role,
    });
  })
);

//get all teachers while changing class teacher by admin
router.get(
  "/teachers",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    const teachers = await User.find({ role: "teacher" });
    res.json({ teachers });
  })
);

//get all students while registering
router.get(
  "/students",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    const students = await User.find({ role: "student" });
    res.json({ students });
  })
);

module.exports = router;
