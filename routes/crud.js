var express = require("express");
var router = express.Router();
var students = require("../models/students");

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

  students.findOne({id: username}).then(student => {
    console.log("i found" + student);

    if(!student) {
      var new_student = new students({
        id: username,
        password: "1234",
      })

      new_student.save().then(created => {
        if(created) {
          res.render('dashboard', {
            logged_in: false,
            success_alert: "No such student! Created " + created.id,
          })
        } else {
          res.render('dashboard', {
            logged_in: false,
            error_alert: "No such student! Failed to create " + created.id,
          })
        }
      })
      
    } else if(student.password == password) {

      var new_student = new students({
        id: username,
        password: "1234",
      })

      new_student.save().then(created => {
        res.render('dashboard', {
          logged_in: false,
          success_alert: "Created another one" + created.id,
        })
      }).catch(err => {
        console.log("Couldn't create new student: " + err);
        res.render('dashboard', {
            logged_in: false,
            error_alert: "Failed to create another one"
        })
      })

      // res.render('dashboard', {
      //   logged_in: true,
      //   success_alert: "No such student! Please use the username provided by 7xstudy",
      // })
    }
    else {
      console.log("you entered " + student.password + " But the correct password is " + password)
      res.render('dashboard', {
      logged_in: false,
      success_alert: "Wrong password!"
    })}

  })
})

module.exports = router;
