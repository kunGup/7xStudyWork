const mongoose = require('mongoose');

module.exports = mongoose.model('teachers', new mongoose.Schema({
    id: { type: String, unique: true},
    name: { type: String },
    info: { type: String }
}));
