const mongoose = require("mongoose");
const applicationSchema = new mongoose.Schema({
  fullname: String,
  email: {
    type: String,
    required: true,
  },
  qualification: String,
  university: String,
  grades: Number,
  experience: String,
  availableTimings: [String],
  isAvailableWeekend: String,
  batches: [
    {
      name: String,
      minCharges: Number,
    },
  ],
  resumeName: String,
});

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
