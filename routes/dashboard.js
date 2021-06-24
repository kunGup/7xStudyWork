var express = require("express");
var router = express.Router();
var Cookies = require("cookies");

// Files for dashboard

// batches_info = require('../dashboard/batches.json');
// students_info = require('../dashboard/students.json');
// payments_info = require('../dashboard/payments.json');

student_infos = require("../dashboard/user_infos.json");
student_passwords = require("../dashboard/user_passwords.json");

router.get("/dashboard", (req, res) => {
  // Create a cookies object
  var cookies = new Cookies(req, res);
  var username = cookies.get("username");
  var password = cookies.get("password");
  if (password === undefined || username === undefined) {
    res.render("dashboard", {
      logged_in: false,
      info_alert: "Please enter the username and password provided by 7xstudy",
    });
  } else if (!student_passwords[username]) {
    res.render("dashboard", {
      logged_in: false,
      warning_alert:
        "No such student! Please use the username provided by 7xstudy",
    });
  } else if (password !== student_passwords[username]) {
    res.render("dashboard", {
      logged_in: false,
      error_alert: "Wrong password!",
    });
  } else {
    res.render("dashboard", {
      logged_in: true,
      userid: username,
      name: student_infos[username]["name"],
      balance: student_infos[username]["balance"],
      classes: student_infos[username]["classes"],
      payments: student_infos[username]["payments"],
      info_alert: "Hello!",
    });
  }
});

router.post("/dashboard", (req, res) => {
  var cookies = new Cookies(req, res);

  //Getting Data From login Page
  var username = req.body.username;
  var password = req.body.password;

  console.log("i got username as: " + username);
  console.log("i got password: " + password);

  console.log("we have password as " + student_passwords[username]);

  if (!(username in student_passwords)) {
    res.render("dashboard", {
      logged_in: false,
      warning_alert:
        "No such student! Please use the username provided by 7xstudy",
    });
  } else if (password == student_passwords[username]) {
    // console.log(
    //   "These are the history I found " + student_infos[username]["history"]
    // );
    cookies.set("username", username);
    cookies.set("password", password);
    res.render("dashboard", {
      logged_in: true,
      userid: username,
      name: student_infos[username]["name"],
      balance: student_infos[username]["balance"],
      classes: student_infos[username]["classes"],
      payments: student_infos[username]["payments"],
      info_alert: "Hello!",
    });
  } else {
    console.log(
      "you entered " +
        password +
        " But the correct password is " +
        student_passwords[username]
    );
    res.render("dashboard", {
      logged_in: false,
      error_alert: "Wrong password!",
    });
  }
});

module.exports = router;
