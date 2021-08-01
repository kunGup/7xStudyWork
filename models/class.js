const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  when: Date,
  subject: String,
  duration: {
    hrs: Number,
    mins: Number,
  },
  class: String,
  completed: {
    type: Boolean,
    default: false,
  },
  joinUrl: String,
  // students: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  // ],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  studentAttended: { type: Array, default: [] },
});
const Class = mongoose.model("Class", classSchema);
module.exports = Class;
