const mongoose = require('mongoose');

module.exports = mongoose.model('students', new mongoose.Schema({
    id: { type: String , unique: true },
    password : { type: String },
    name: { type: String },
    info: { type: String }
}));