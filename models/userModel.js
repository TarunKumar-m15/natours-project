const mongoose = require('mongoose');
const validator = require('validator');

//name,email,photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name must require'],
        maxlength: [40, 'name must less than or equal to 40'],
        minlength: [10, 'name must greater than or equal to 10']
    },
    email: {
        type: String,
        required: [true, 'email must require'],
        unique: true,
        lowercase : true,
        validate:[validator.isEmail,'provide valid email']
    },
    photo:String,
    password:{
        type:String,
        required:[true,'a user must set password'],
        unique:[true,'password already used'],
        trim:true,
        minlength:[8,'password must greater than or equal to 8']

    },
    passwordConfirm:{
        type:String,
        required:[true,'verify your password']
    }
});


const User = mongoose.model('User',userSchema);

module.exports = User;