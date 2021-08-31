var express = require("express");
var router = express.Router();
const axios = require("axios");
const User = require("../models/user");
const Class = require("../models/class");
const Review = require("../models/review");
const TeacherFeedback = require("../models/teacherFeedback");
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
  validateTeacherFeedback,
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
    let classes = await Class.find({ students: req.params.studentId }).populate(
      "teacher"
    );
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
      })
      .populate({
        path: "teacherFeedbacks",
        populate: {
          path: "student",
        },
      });
    var dt = new Date(cls.when.toString().split("+")[0] + "+05:30");
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
    let { hrs, mins, time, date, A, wdays, endby, students } = req.body;
    var convertedTime = moment(`${time} ${A}`, "hh:mm A").format("HH:mm");
    var start = new Date(`${date}T${convertedTime}+05:30`);
    var end = new Date(`${endby}T${convertedTime}+05:30`);
    let dates = [];
    wdays = [].concat(wdays);
    students = [].concat(students);
    wdays.forEach((day) => {
      dates.push(...getDaysBetweenDates(start, end, day));
    });
    dates.forEach(async (date) => {
      await createClass(date);
    });
    async function createClass(when) {
      const newClass = new Class({
        ...req.body,
        students,
        teacher: req.user._id,
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
    res.redirect("back");
  })
);

//update classInfo
router.put(
  "/class/:classId",
  ensureAuthenticated,
  validateClassUpdate,
  catchAsync(async (req, res, next) => {
    const { classId } = req.params;
    await Class.findByIdAndUpdate(classId, req.body);
    req.flash("success_alert", "Class updated successfully");
    res.redirect("back");
  })
);

//reschedule class
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
        <li><b>Teacher</b>: ${cls.teacher.fullname}</li>
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
    res.redirect("back");
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
        <li><b>Teacher</b>: ${cls.teacher.fullname}</li>
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
    res.redirect("back");
  })
);

//post feedback
router.post(
  "/class/:classId/review",
  ensureAuthenticated,
  isWithinTime,
  isAlreadySubmitted,
  validateReview,
  catchAsync(async (req, res) => {
    const cls = await Class.findById(req.params.classId);
    let { rating, body, feedbackChecked } = req.body;
    feedbackChecked = [].concat(feedbackChecked);
    const review = new Review({ rating, body, feedbackChecked });
    review.student = req.user._id;
    cls.reviews.push(review);
    await review.save();
    await cls.save();
    req.flash("success", "Created new feedback!");
    res.redirect("back");
  })
);
async function isWithinTime(req, res, next) {
  const cls = await Class.findById(req.params.classId);
  let hrs = parseInt(cls.duration.hrs);
  let mins = parseInt(cls.duration.mins);
  let totalMins = 60 * hrs + mins;
  let timeAfterClass = add_minutes(cls.when, totalMins);
  let time5minsAfterClass = add_minutes(cls.when, totalMins + 5);
  if (isBetween(timeAfterClass, time5minsAfterClass)) {
    next();
  } else {
    req.flash("error_alert", "You can't fill attendance now");
    res.redirect("back");
  }
}
var add_minutes = function (dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
};
const isBetween = (min, max) => {
  let rightNow = new Date();
  return (
    rightNow.getTime() >= min.getTime() && rightNow.getTime() <= max.getTime()
  );
};
async function isAlreadySubmitted(req, res, next) {
  const cls = await Class.findById(req.params.classId).populate("reviews");
  let found = false;

  for (let i = 0; i < cls.reviews.length; i++) {
    if (cls.reviews[i].student.equals(req.user._id)) {
      found = true;
      break;
    }
  }
  if (found) {
    req.flash("error_alert", "You have already filled the feedback");
    res.redirect("back");
  } else {
    next();
  }
}

//post teacher feedback
router.post(
  "/class/:classId/teacherFeedback",
  ensureAuthenticated,
  validateTeacherFeedback,
  catchAsync(async (req, res) => {
    const cls = await Class.findById(req.params.classId);
    let { rating, body, feedbackChecked, student } = req.body;
    feedbackChecked = [].concat(feedbackChecked);
    const review = new TeacherFeedback({
      rating,
      body,
      feedbackChecked,
      student,
    });
    cls.teacherFeedbacks.push(review);
    await review.save();
    await cls.save();
    req.flash("success", "Created new feedback!");
    res.redirect("back");
  })
);
//class meeting room[deprecated because now we are using join and start urls]
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
  res.redirect("back");
});

module.exports = router;
