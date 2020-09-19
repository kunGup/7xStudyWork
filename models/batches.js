const mongoose = require('mongoose');

module.exports = mongoose.model('batches', new mongoose.Schema({
    id: { type: String , unique: true },
    teacher_id: : { type: String },
    student_ids: : { type: String },
    info: { type: String }
}));