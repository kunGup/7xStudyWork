var express = require("express");
var router = express.Router();

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


//Log In ########################################################################

//Middleware Function to check Authentication

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

router.get('/cart',  (req,res)=> {
  var loginUsername = localStorage.getItem('loginUsername');

  res.render('cart', {
    loginUsername: loginUsername
  })

  console.log(loginUsername)
})





module.exports = router;

