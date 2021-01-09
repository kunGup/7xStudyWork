var express = require("express");
var router = express.Router();

////////////////////////////////////////////////////////////////////////////////////////////


//>>>>>>>>>>>>>>>>>>>>>> ROUTES <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<//


router.get("/", (req, res) => {
  res.render("home", {});
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


// TODO: set up a mail forwarder here.
router.post('/', (req,res)=> {

  // const MyData = {

  //   name : req.body.contactus_name,
  //   phone: req.body.contactus_phone,
  //   message: req.body.contactus_yourmessage,

  // } 

  // const Data = contactusModel(MyData)

  // Data.save((err, docs)=> {
  //   if(err){
  //     console.log('ERROR ')
  //   }
  //   else{
  //     console.log(docs)
  //     res.redirect('/')
  //   }
  // })

})

module.exports = router;
