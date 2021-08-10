const mongoose = require("mongoose");
const applicationSchema = new mongoose.Schema({
  fullname: String,
  email: {
    type: String,
    required: true,
  },
  qualification: String,
  university: String,
  grades: String,
  experience: String,
  availableTimings: [String],
  isAvailableWeekend: String,
  batches: [String],
  minCharges: [String],
  resumeName: String,
});

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
