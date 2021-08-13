const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
// const baseOptions = {
//   discriminatorKey: "__role",
//   collection: "users",
// };
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["teacher", "student", "admin"],
    required: true,
  },

  //student
  class: String,

  //teacher
  // minCharges: [String],
  // batches: [String],
  // isAvailableWeekend: String,
  // availableTimings: [String],
  // grades: String,
  // qualification: String,
  // university: String,
  // experience: String,
  // resumeName: String,

  apikey: String,
  apisecret: String,
  classroom: {
    id: String,
    join_url: String,
    start_url: String,
    pwd: String,
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;

// const studentSchema = mongoose.Schema({
//   class: String,
// });
// const teacherSchema = mongoose.Schema({

//   minCharges: [String],
//   batches: [String],
//   isAvailableWeekend: String,
//   timings: [String],
//   grades: String,
//   qualification: String,
//   university: String,
//   apikey: String,
//   apisecret: String,
//   classroom: {
//     id: String,
//     join_url: String,
//     start_url: String,
//     pwd: String,
//   },
// });
// const adminSchema = mongoose.Schema({})
