const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: String,
  feedbackChecked: [String],
  rating: Number,
  student: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
const Review = mongoose.model("TeacherFeedback", reviewSchema);
module.exports = Review;
