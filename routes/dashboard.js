var express = require("express");
var router = express.Router();

router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
  	logged_in: false,
  	tried_login: false,
  })
})

module.exports = router;



// ##################################################################

var express = require("express");
var router = express.Router();

var customId = require("custom-id");
var studentModel = require("../models/students");

//requiring bcrypt js
var bcrypt = require("bcrypt");

//IMPORTING JWT
var jwt = require('jsonwebtoken');

//IMPORTING NODE LOCAL STORAGE
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

function checkDublicateEmail (req,res,next) {

    var email = req.body.student_email;

    var checkEmail = studentModel.findOne({
        email: email
    });

    checkEmail.exec((err, docs) => {
        if(err) throw err;

        if(docs)

            return res.render('register', { msg : 'Email ID already exists !' } )

        next();
    })

}


//Registration ########################################################################

router.get("/register", (req, res) => {
  
  var loginUsername = localStorage.getItem('loginUsername');
  res.render("register", {

    msg: "",
    loginUsername : loginUsername

  });
});

router.post("/register", checkDublicateEmail, (req, res) => {

  //generating custom UId
  var UId =
    "STU" +
    customId({
      name: "123456",
      email: "78910",
    });

  //getting form data
  var name = req.body.student_name;
  var email = req.body.student_email;
  var phone = req.body.student_phone;
  var gender= req.body.student_gender;
  var city = req.body.student_city;
  var cls = req.body.student_cls;
  var board = req.body.student_board;
  var marks = req.body.student_marks;
  var gaurdianName = req.body.student_gaurdianName;

  var password =  req.body.student_password;
  var confpassword = req.body.student_confpassword;

  //Checking that the password is same or not
  if (password != confpassword) {
    res.render("register", {
      msg: "Password Do Not Match !"
    });
  } else {

    var bcryptPassword = bcrypt.hashSync(password, 10);

    //getting form data to model
    var studentDetails = new studentModel({
      UId: UId,
      name: name,
      email: email,
      phone: phone,
      gender: gender,
      city: city,
      cls: cls,
      board: board,
      marks: marks,
      gaurdianName: gaurdianName,
      password: bcryptPassword
    });

    //saving model to DB

    studentDetails.save((err, docs) => {
      if (err) throw err;
      else res.render("register" , {
        msg: "You Are Registered Succesfully !"
      });
    });

  }
});

//Log In ########################################################################

//Middleware Function to check Authentication

function checkLoginUser(req,res,next){

  var userToken = localStorage.getItem('userToken');

  //using try catch of jwt

  try {
      var decoded = jwt.verify(userToken, 'LoginToken');
    } catch(err) {
      res.redirect('/')
    }

  next();

}

//Log in Register ########################################################################

router.get("/login", (req, res) => {
  res.render("login", {
    msg : '',
    loginUsername : ''
  });
});


router.post('/login', (req,res) => {

  //Getting Data From login Page
  var get_email = req.body.student_email;
  var password = req.body.student_password;

  //checking username
  var checkUser = studentModel.findOne({email:get_email});

  checkUser.exec((err,docs) => {

      if (err) throw err;

      if(docs !== null){ 

      //Getting Password from Db
      var getUserID = docs._id;
      var getPassword = docs.password;
      var getUserName = docs.email;

      //checking if the db password & and login page password is same or not
      //also we have to decrypt the password 
      //if both are same then login succesfull

      if(bcrypt.compareSync( password, getPassword )){

      //Getting id from model in Token using jwt token
      var token = jwt.sign({ userID: getUserID }, 'LoginToken');
      //setting token to local storage
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUsername', getUserName);

      // console.log(localStorage.getItem('userToken'));
      // console.log(localStorage.getItem('loginUsername'));
      //redirect after login

      var loginUsername = localStorage.getItem('loginUsername');
      res.redirect('/dashboard')
      }

      else{
        console.log('wrong Password')
        res.render('login', {
          msg : "Wrong Password !"
        })
  
        }
      }

  })

})


//Profile ########################################################################

router.get('/profile' , checkLoginUser ,(req, res, next) => {

  var loginUsername = localStorage.getItem('loginUsername');

  studentModel.findOne({email:loginUsername}, (err, docs)=> {
    if (err) {
      console.log('Error Showing Profile !')
    }

    else{
      console.log(docs)
    }
  })

})


//Log Out ########################################################################

//unset the jwt token userID & username
router.get('/logout', (req,res) => {

  localStorage.removeItem('userToken');
  localStorage.removeItem('loginUsername')

  //redirect to /
  res.redirect('/');
})






module.exports = router;
