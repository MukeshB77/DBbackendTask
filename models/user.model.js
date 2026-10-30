const mongoose = require("mongoose");

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

module.exports = User;