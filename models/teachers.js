const mongoose = require('mongoose');

module.exports = mongoose.model('teachers', new mongoose.Schema({
    id: { type: String, required: true, unique: true},
    name: { type: String },
    info: { type: String }
}));
