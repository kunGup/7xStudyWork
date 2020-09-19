const mongoose = require('mongoose');

module.exports = mongoose.model('students', new mongoose.Schema({
    id: { type: String, required: true , unique: true },
    password : { type: String, required: true },
    name: { type: String },
    info: { type: String },
}));