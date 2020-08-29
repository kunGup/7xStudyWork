const mongoose = require('mongoose');

 var contactusSchema = new mongoose.Schema({

    name: {
        type: String
    },

    phone: {
        type: Number
    },

    message : {
        type: String
    },

 })

 var contactusModel = mongoose.model('contactus', contactusSchema);
 module.exports = contactusModel;