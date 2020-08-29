const mongoose = require('mongoose');

 var teacherSchema = new mongoose.Schema({

    UId: {
        type: String
    },
    
    firstname: {
        type: String
    },

    lastname: {
        type: String
    },

    email: {
        type: String
    },

    password : {
        type: String
    },

    date: { 
        type: Date, 
        default: Date.now 
    }

 })

 var teacherModel = mongoose.model('teachers', teacherSchema);
 module.exports = teacherModel;