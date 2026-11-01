const mongoose = require("mongoose");

const USER_ROLES = Object.freeze({
    STUDENT: "student",
    FACULTY: "faculty",
});

const userSchema = new mongoose.Schema(
    {
 name:{
    type: String,
    required:[true,"Name is missing"],
    trim:true
 },
 email:{
    type:String,
    required:[true,"email is missing"],
    unique:true,
    trim:true,
    lowercase:true
 },
 role:{
    type:String,
    enum:Object.values(USER_ROLES),
    default:USER_ROLES.STUDENT,
    required:true
 },
 password:{
    type:String,
    required:[true,"Password is rquired"],
    select:false
 },
 isActive:{
    type:Boolean,
    default:true
 },
profile:{
   type: mongoose.Schema.Types.ObjectId,
   ref:'UserProfile'
}
    },{
        timestamps:true,
    }
);

const User = mongoose.model("User",userSchema);

User.ROLES = USER_ROLES;

module.exports = User;