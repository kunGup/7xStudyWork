var express = require("express");
var router = express.Router();
const axios = require("axios");
const User = require("../models/user");
const Class = require("../models/class");
const Review = require("../models/review");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var moment = require("moment");

const {
  validateClass,
  validateClassUpdate,
  validateChangeTeacher,
  validateReview,
  isAdmin,
  isTeacher,
  isNotStudent,
  ensureAuthenticated,
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

//get student info
router.get(
  "/student/:studentId",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    let student = await User.findById(req.params.studentId);
    res.render("student", { layout: "dlayout", student });
  })
);

//get classes of student
router.get(
  "/student/:studentId/classes",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    let classes = await Class.find({ student: req.params.studentId });
    res.json({ classes });
  })
);

router.get(
  "/user",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    res.render("user", { layout: "dlayout" });
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
    let {
      title,
      topic,
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
      wdays,
      endby,
    } = req.body;
    var convertedTime = moment(`${time} ${A}`, "hh:mm A").format("HH:mm");
    var start = new Date(`${date}T${convertedTime}`);
    var end = new Date(`${endby}T${convertedTime}`);
    let dates = [];
    wdays = [].concat(wdays);
    student = [].concat(student);
    wdays.forEach((day) => {
      dates.push(...getDaysBetweenDates(start, end, day));
    });
    dates.forEach(async (date) => {
      await createClass(date);
    });
    async function createClass(when) {
      const newClass = new Class({
        title,
        topic,
        subject,
        students: student,
        teacher: req.user._id,
        class: standard,
        duration: { hrs, mins },
        when,
      });
      await newClass.save();
    }
    function getDaysBetweenDates(start, end, dayName) {
      var result = [];
      var days = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      var day = days[dayName.toLowerCase().substr(0, 3)];
      // Copy start date
      var current = new Date(start);
      // Shift to next of required days
      current.setDate(current.getDate() + ((day - current.getDay() + 7) % 7));
      // While less than end date, add dates to result array
      while (current <= end) {
        result.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }

      return result;
    }
    req.flash("success_alert", "New class created");
    res.redirect("/dashboard");
  })
);

//update classInfo
router.put(
  "/class/:classId",
  ensureAuthenticated,
  catchAsync(async (req, res, next) => {
    const { classId } = req.params;
    let { title, topic, subject, meetUrl, isCompleted } = req.body;
    var status = isCompleted === "true" ? true : false;
    await Class.findByIdAndUpdate(classId, {
      title,
      topic,
      subject,
      meetUrl,
      status,
    });
    req.flash("success_alert", "Class updated successfully");
    res.redirect(`/dashboard/class/${classId}`);
  })
);

router.put(
  "/class/:classId/reschedule",
  ensureAuthenticated,
  catchAsync(async (req, res, next) => {
    const { classId } = req.params;
    const { hrs, mins, time, date, A } = req.body;
    var convertedTime = moment(`${time} ${A}`, "hh:mm A").format("HH:mm");
    var when = new Date(`${date}T${convertedTime}`);
    const cls = await Class.findByIdAndUpdate(classId, {
      duration: { hrs, mins },
      when,
    })
      .populate("students")
      .populate("teacher");
    const emails = cls.students.map(function (student) {
      return student.email;
    });
    const output = `
      <p>Class has been rescheduled</p>
      <ul>  
        <li><b>Title</b>: ${cls.title}</li>
        <li><b>Topic</b>: ${cls.topic ? cls.topic : "NA"}</li>
        <li><b>Subject</b>: ${cls.subject}</li>
        <li><b>Teacher</b>: ${cls.teacher.username}</li>
        <li><b>When</b>: ${time} ${A}, ${date}</li>
        <li><b>Duration</b>: ${hrs} hrs ${mins} mins</li>
        
      </ul>
      <p>Join the class using:</p>
      <ul>
        <li><a href="${cls.teacher.classroom.join_url}">Zoom</a></li>
        ${
          cls.meetUrl ? `<li><a href="${cls.meetUrl}">Google Meet</a></li>` : ""
        }
      </ul>
    `;
    await notify(emails, "Class rescheduled", output);
    req.flash("success_alert", "Class Rescheduled successfully");
    res.redirect(`/dashboard/class/${classId}`);
  })
);

router.put(
  "/class/:classId/attendance",
  ensureAuthenticated,
  catchAsync(async (req, res) => {
    const { classId } = req.params;
    await Class.findByIdAndUpdate(classId, {
      studentAttended: req.body.student,
    });
    req.flash("success_alert", "Attendance updated successfully");
    res.redirect(`/dashboard/class/${classId}`);
  })
);
//cancel class
router.delete(
  "/class/:classId",
  ensureAuthenticated,
  catchAsync(async (req, res, next) => {
    const { classId } = req.params;
    const cls = await Class.findByIdAndRemove(classId)
      .populate("students")
      .populate("teacher");
    cls.reviews.forEach(async (review) => {
      await Review.findByIdAndDelete(review._id);
    });
    const emails = cls.students.map(function (student) {
      return student.email;
    });
    var dt = new Date(cls.when);
    let info = {
      date: `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`,
      time: `${format(dt.getHours())}:${format(dt.getMinutes())}`,
    };
    function format(num) {
      return num < 10 ? "0" + num : num;
    }
    const output = `
      <p>Class has been cancelled</p>
      <ul>  
        <li><b>Title</b>: ${cls.title}</li>
        <li><b>Topic</b>: ${cls.topic ? cls.topic : "NA"}</li>
        <li><b>Subject</b>: ${cls.subject}</li>
        <li><b>Teacher</b>: ${cls.teacher.username}</li>
        <li><b>When</b>: ${info.time}, ${info.date}</li>
      </ul>
    `;
    await notify(emails, "Class Cancelled", output);
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

async function notify(emails, subject, output) {
  var transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: "7xopenchannel@gmail.com",
        pass: "anyonecanhackthis",
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );

  var mailOptions = {
    from: "7xopenchannel@gmail.com",
    to: emails,
    subject,
    html: output,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

router.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  console.log(err);
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  req.flash("error_alert", err.message);
  const redirectUrl = req.session.returnTo || "/dashboard";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

module.exports = router;
