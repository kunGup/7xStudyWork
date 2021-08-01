// const bcrypt = require("bcrypt");

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash("password", salt, (err, hash) => {
//     if (err) throw err;
//     //save hash to pass
//     console.log(hash);
//   });
// });
// const Class = require("./models/class");
// Class.find(
//   {
//     "students._id": {
//       $in: [mongoose.Types.ObjectId("60f5bc586365d809f834a780")],
//     },
//   },
//   (err, classes) => {
//     console.log(classes);
//   }
// );
// var dateInPast = function (firstDate, secondDate) {
//   if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
//     return true;
//   }

//   return false;
// };

// var past = new Date("2020-05-20");
// var today = new Date();
// var future = new Date("2030-05-20");
// dateInPast(past, today);
// dateInPast(future, today);
