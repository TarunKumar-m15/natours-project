const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    role:{
        type:String,
        enum:['user','admin','guide','lead-guide'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'a user must set password'],
        trim:true,
        minlength:[8,'password must greater than or equal to 8'],
        select:false

    },
    passwordConfirm:{
        type:String,
        required:[true,'verify your password'],
        validate : {
            validator : function(el){
                return el === this.password;
            },
            message: 'passwords are not same'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date

});


userSchema.pre('save',async function(){
    // it runs only if password was created or modified
    if(!this.isModified('password')) return ;
    
    //hash the password with cost of 12
    this.password = bcrypt.hash(this.password, 12);
    
    //delete the passwordConfirm
    this.passwordConfirm = undefined;
})

userSchema.methods.correctPassword = async function(candidatePassword,userpassword){
    return await bcrypt.compare(candidatePassword,userpassword);
}

userSchema.methods.changedPasswordAfter = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000,10);
        return JWTTimestamp < changedTimeStamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.
        createHash('sha256').
        update(resetToken).
        digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}

const User = mongoose.model('User',userSchema);

module.exports = User;