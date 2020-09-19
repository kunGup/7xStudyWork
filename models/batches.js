const mongoose = require('mongoose');

module.exports = mongoose.model('batches', new mongoose.Schema({
    id: { type: String, require: true, unique: true },
    name: {type: String, required: true},
    subject: {type: String, required: true},
    grade: {type: String, required: true},
    teacher_id: { type: String, required: true },
    student_ids: { type: [String] },
    info: { type: String }
}));