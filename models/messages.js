const mongoose = require('mongoose');

module.exports = mongoose.model('messages', new mongoose.Schema({
    name: { type: String },
    phone: { type: Number },
    message : { type: String },
    time: { type: Date, default: Date.now }
 }));