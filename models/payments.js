const mongoose = require('mongoose');

module.exports = mongoose.model('payments', new mongoose.Schema({
    student_id: { type: String, required: true},
    amount : { type: Number, required: true },
    date : { type: Date, required: true, default: Date.now },
    info: { type: String, required: true },
}));