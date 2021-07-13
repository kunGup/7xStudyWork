const mongoose = require("mongoose");
// const classSchema = new mongoose.Schema({
//   timestamp: {
//     type: Number,
//   },
//   date: {
//     type: String,
//   },
//   amount: {
//     type: Number,
//   },
//   info: {
//     type: String,
//   },
// });
// const paymentSchema = new mongoose.Schema({
//   timestamp: {
//     type: Number,
//   },
//   date: {
//     type: String,
//   },
//   amount: {
//     type: Number,
//   },
//   info: {
//     type: String,
//   },
// });
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["teacher", "student", "admin"],
    required: true,
  },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  apikey: String,
  apisecret: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
