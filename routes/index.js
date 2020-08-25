var express = require("express");
var router = express.Router();

var contactusModel = require("../models/contactus");

//IMPORTING NODE LOCAL STORAGE
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

////////////////////////////////////////////////////////////////////////////////////////////


//>>>>>>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<//


router.get("/", (req, res) => {
  var loginUsername = localStorage.getItem("loginUsername");

  res.render("home", {
    loginUsername: loginUsername,
  });
});


//Courses

jsonData = require('../public/js/courses.json');

router.get('/courses', (req,res)=> {
  var loginUsername = localStorage.getItem("loginUsername");
  res.render("courses", {
    loginUsername: loginUsername,
    jsonData : jsonData
  });
})


//Details 

router.get('/courses/details', (req,res)=> {

  var loginUsername = localStorage.getItem("loginUsername");
  res.render('coursesDetails',{
    loginUsername: loginUsername,
    courseData : jsonData[req.query.course_type]
  });
})


router.post('/', (req,res)=> {

  const MyData = {

    name : req.body.contactus_name,
    phone: req.body.contactus_phone,
    message: req.body.contactus_yourmessage,

  } 

  const Data = contactusModel(MyData)

  Data.save((err, docs)=> {
    if(err){
      console.log('ERROR ')
    }
    else{
      console.log(docs)
      res.redirect('/')
    }
  })

})


// router.get("/contact", (req, res) => {
//   var loginUsername = localStorage.getItem("loginUsername");
//   res.render("contact", {
//     loginUsername: loginUsername,
//   });
// });

// router.post("/contact", (req, res) => {
//   var loginUsername = localStorage.getItem("loginUsername");

//   console.log(req.body);

//   var contactDetails = {
//     name: req.body.contactus_name,
//     phone: req.body.contactus_phone,
//     message: req.body.contactus_yourmessage,
//   };

//   var Date = contactusModel(contactDetails);

//   Date.save((err, docs) => {
//     if (err) throw err;
//     else {
//       res.render("contact", {
//         loginUsername: loginUsername,
//       });
//     }

//     console.log(docs);
//   });
// });

module.exports = router;
