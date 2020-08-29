const mongoose = require('mongoose');

 var studentSchema = new mongoose.Schema({

    UId: {
        type: String
    },
    
    name: {
        type: String
    },

    email: {
        type: String
    },

    phone: {
        type: Number
    },

    gender:{
        type: String
    },

    city:{
        type: String
    },

    cls:{
        type: String
    },

    board:{
        type: String
    },

    marks:{
        type:Number
    },

    gaurdianName:{
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

 var studentModel = mongoose.model('students', studentSchema);
 module.exports = studentModel;