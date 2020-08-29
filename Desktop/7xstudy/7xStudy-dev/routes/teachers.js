var express = require("express");
var router = express.Router();

var customId = require("custom-id");
var teacherModel = require("../models/teachers");

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

    var email = req.body.teacher_email;

    var checkEmail = teacherModel.findOne({
        email: email
    });

    checkEmail.exec((err, docs) => {
        if(err) throw err;

        if(docs)

            return res.render('/teachers/teachersRegister', { msg : 'Email ID already exists !' } )

        next();
    })

}


//Registration ########################################################################

router.get("/register", (req, res) => {
    res.render("teacher/teacherRegister", {
  
      msg: ""
  
    });
  });

router.post("/register", checkDublicateEmail, (req, res) => {

  //generating custom UId
  var UId =
    "TCH" +
    customId({
      name: "123456",
      email: "78910",
    });

  //getting form data
  var firstname = req.body.teacher_firstname;
  var lastname = req.body.teacher_lastname;
  var email = req.body.teacher_email;
  var phone = req.body.teacher_phone;
  var password =  req.body.teacher_password;
  var confpassword = req.body.teacher_confpassword;

  //Checking that the password is same or not
  if (password != confpassword) {
    res.render("register", {
      msg: "Password Do Not Match !"
    });
  } else {

    var bcryptPassword = bcrypt.hashSync(password, 10);

    //getting form data to model
    var teacherDetails = new teacherModel({
      UId: UId,
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: phone,
      password: bcryptPassword
    });

    //saving model to DB

    teacherDetails.save((err, docs) => {
      if (err) throw err;
      else res.redirect("/");
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

router.get("/", (req, res) => {
    res.render("teacher/teacherLogin", {
  
      msg: ""
  
    });
});

router.post('/', (req,res) => {

  //Getting Data From login Page
  var username = req.body.firstname;
  var password = req.body.teacher_password;

  //checking username
  var checkUser = teacherModel.findOne({username:username});

  checkUser.exec((err,docs)=>{

      if (err) throw err

      if(docs !== null){ 

      //Getting Password from Db
      var getUserID = docs._id;
      var getPassword = docs.password;

      //checking if the db password & and login page password is same or not
      //also we have to decrypt the password 
      //if both are same the login succesfull

      if(bcrypt.compareSync( password, getPassword )){

      //Getting id from model in Token using jwt token
      var token = jwt.sign({ userID: getUserID }, 'LoginToken');
      //setting token to local storage
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginUsername', username);
      // console.log(localStorage.getItem('userToken'));
      // console.log(localStorage.getItem('loginUsername'));

      //redirect after login
      res.redirect('/dashboard' )

      }
      }

      else{

      res.render('teacherDashboard')
      }

  })

})

//Get logout page -> no page
//unset the jwt token userID & username
router.get('/logout', (req,res) => {

    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUsername')

    //redirect to /
    res.redirect('/');
})




router.get('/teacherdashboard' , checkLoginUser ,(req, res) => {
  res.render('/teacher/teacherDashboard')
})



module.exports = router;
