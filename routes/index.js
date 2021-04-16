var express = require("express");
var router = express.Router();

const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');

////////////////////////////////////////////////////////////////////////////////////////////


//>>>>>>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<//


router.get("/", (req, res) => {
  res.render("home", {
    alert_msg: ""
  });
});


//Teachers

teachers_json = require('../public/js/faculty.json');


router.get('/faculty', (req,res)=> {
  res.render("faculty", {
    teachers_json : teachers_json
  });
})


//Courses

jsonData = require('../public/js/courses.json');

router.get('/courses', (req,res)=> {
  res.render("courses", {
    jsonData : jsonData
  });
})


//Details 

router.get('/courses/details', (req,res)=> {

  res.render('coursesDetails',{
    courseData : jsonData[req.query.course_type]
  });
})

//About us 
router.get('/aboutus', (req,res)=> {
  res.render('aboutus',{
  });
})

//About us 
router.get('/faqs', (req,res)=> {
  res.render('faqs',{
  });
})


testimonials_json = require('../public/js/testimonials.json');

router.get('/testimonials', (req,res)=> {
  res.render("testimonials", {
    testimonials_json : testimonials_json
  });
})


router.post('/', (req, res) => {

  const { firstname, lastname, email, message } = req.body;

  console.log(req.body);

  var transporter = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
          user: "7xopenchannel@gmail.com",
          pass: "anyonecanhackthis"
      }
  }));

  var mailOptions = {
      from: email,
      to: '7xstudy@gmail.com',
      subject: 'mail from 7xstudy website contact form',
      text: firstname + ' ' + lastname + ' says:\n' + message
  };

  transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
          console.log(error);
          res.render('home', {
              alert_msg: "Unable to send email"
          })
      } else {
          console.log('Email sent: ' + info.response);
          res.render('home', {
              alert_msg: "Email Sent Sucessfully"
          })
      }
  });

})



module.exports = router;
