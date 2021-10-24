const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  topic: String,
  when: Date,
  subject: String,
  duration: {
    hrs: Number,
    mins: Number,
  },
  class: String,
  meetUrl: String,
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
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  teacherFeedbacks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherFeedback",
    },
  ],
});
const Class = mongoose.model("Class", classSchema);
module.exports = Class;
