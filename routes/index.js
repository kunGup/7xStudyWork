var express = require('express');
var router = express.Router();


var contactusModel = require('../models/contactus')

//IMPORTING NODE LOCAL STORAGE
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

router.get('/', (req,res) => {

    var loginUsername = localStorage.getItem('loginUsername');

    res.render('home', {
    loginUsername : loginUsername
  })
})

router.get('/contact', (req,res) => {
  var loginUsername = localStorage.getItem('loginUsername');
    res.render('contact',{
      loginUsername : loginUsername
    })
})


router.post('/contact', (req,res)=> {
  var loginUsername = localStorage.getItem('loginUsername');


  console.log(req.body);

  var contactDetails = { name: req.body.contactus_name,
                         phone: req.body.contactus_phone,
                         message: req.body.contactus_yourmessage
  }

  var Date = contactusModel(contactDetails);

  Date.save((err, docs)=> {
    if (err) throw err
    else{
      res.render('contact',{
        loginUsername : loginUsername
      })
    }

    console.log(docs)
  })

})


module.exports = router;