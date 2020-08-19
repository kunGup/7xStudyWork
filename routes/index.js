var express = require("express");
var router = express.Router();

var contactusModel = require("../models/contactus");

//IMPORTING NODE LOCAL STORAGE
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

router.get("/", (req, res) => {
  var loginUsername = localStorage.getItem("loginUsername");

  res.render("home", {
    loginUsername: loginUsername,
  });
});


//Courses

myData = require('../public/js/cources.json');

router.get('/courses', (req,res)=> {

  var loginUsername = localStorage.getItem("loginUsername");
  res.render("courses", {
    loginUsername: loginUsername,
    jsonData : myData

  });
})


//Regular 

router.get('/courses/regular', (req,res)=> {

  var loginUsername = localStorage.getItem("loginUsername");

  res.render('regularCoursesDetails',{

    loginUsername: loginUsername,
    jsonData : myData

  } )
})


//Fastrack 

router.get('/courses/fastrack', (req,res)=> {

  var loginUsername = localStorage.getItem("loginUsername");

  res.render('fastrackCoursesDetails',{

    loginUsername: loginUsername,
    jsonData : myData

  } )
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
