const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  timing: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  meetingId: {
    type: String,
    required: true,
  },
  meetingPwd: {
    type: String,
    required: true,
  },
  joinUrl: {
    type: String,
    required: true,
  },
});
const Class = mongoose.model("Class", classSchema);
module.exports = Class;
