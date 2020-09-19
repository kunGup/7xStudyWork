var express = require("express");
var router = express.Router();
var students_model = require("../models/students");
var teachers_model = require("../models/teachers");
var batches_model = require("../models/batches");
var payments_model = require("../models/payments");


// Files for dashboard

batches_info = require('../dashboard/batches.json');
students_info = require('../dashboard/students.json');
payments_info = require('../dashboard/payments.json');


router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
  	logged_in: false,
  	info_alert: "Please enter the username and password provided by 7xstudy",
  })
})


router.post('/dashboard', (req, res) => {
  //Getting Data From login Page
  var username = req.body.username;
  var password = req.body.password;

  console.log("i got username as: " + username);
  console.log("i got password: " + password);

  students_model.findOne({id: username}).then(student => {
    console.log("i found" + student);

    if(!student) {
      res.render('dashboard', {
        logged_in: false,
        warning_alert: "No such student! Please use the username provided by 7xstudy",
      })
      
    } else if(student.password == password) {     
      console.log("okay I loaded everything..")

      var batch_statuses = [];
      batches_model.find({student_ids: student.id}).then(batches => {
        console.log("hey i tried looking")
        console.log(batches);
        for(var i in batches) {
          batch_statuses.push(batches_info[batches[i]["id"]]);
        }
        console.log("batch ids are " + batch_statuses);
        var batch_teacher_names = [];

        payments_model.find({student_id: student.id}).sort({date: -1}).limit(10).then(payments => {
          console.log("These are the payments I found " + payments)
          res.render('dashboard', {
            logged_in: true,
            student_id: student.id,
            payments: payments,
            student_name: student.name,
            batches: batches,
            batch_statuses: batch_statuses,
            student_info: students_info[student.id],
            info_alert: payments_info[student.id],
          })
        })
        
      }).catch(err => console.log(err))
      
    } else {
      console.log("you entered " + student.password + " But the correct password is " + password)
      res.render('dashboard', {
        logged_in: false,
        error_alert: "Wrong password!"
      })
    }
  })
})

module.exports = router;
