const User = require("../models/user.model");
const UserProfile = require("../models/user.profile.model");
const bcrypt = require("bcrypt");
const jwtTokenService = require("../jwt/token.service");
const { default: mongoose } = require("mongoose");


class UserService {
  async signup(name, email, password, role) {
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      const error = new Error("Name, email, and password are required");
      error.statusCode = 400;
      throw error;
    }

    // if(role !== undefined && role !== User.ROLES.STUDENT){
    //   const error = new Error("Public signup is only available for students");
    //   error.statusCode = 403;
    //   throw error;
    // }
    const hashpass = await bcrypt.hash(String(password), 10);

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashpass,
      role: role,
      // role: User.ROLES.STUDENT,
    });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
    // return user
  }

  async getallfaculty() {
    return User.find({ role: User.ROLES.FACULTY, isActive: true }).populate("profile");
  }

  async getallstudent() {
    return User.find({ role: User.ROLES.STUDENT, isActive: true }).populate("profile");
  }

  async getalluser() {
    return User.find({ isActive: true }).populate("profile");
  }

 async getalluserWithoutPop() {
    const users = await User.find({ isActive: true});
    const userIds = users.map((user)=> user._id);
    const userProfiles = await UserProfile.find({ user: { $in : userIds}})

    const usersWithProfiles = users.map((user)=>{
        const profile = userProfiles.find(
            (profile) => profile.user.toString() === user._id.toString(),
        );
        return{
            ...user.toObject(),
            profile: profile || null,
        };
    });

    return usersWithProfiles;
  }

  async getUserByQuery(name, email) {
    const filter = { isActive: true };
    if (name) {
      filter.name = name;
    }
    if (email) {
      filter.email = email;
    }
    const users = await User.find(filter);
    return users;
  }

  async updateUserById(id, updateData, actor) {
    if(!mongoose.isValidObjectId(id)){
      const error = new Error("Invalid user ID");
      error.statusCode = 400;
      throw error;
    }

    const target = await User.findById(id);
    if(!target || !target.isActive){
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isSelf = target._id.toString() === actor.id;
    const canUpdate =
      actor.role === User.ROLES.STUDENT && isSelf ||
      actor.role === User.ROLES.FACULTY &&
        (isSelf || target.role === User.ROLES.STUDENT);
    if(!canUpdate){
      const error = new Error("You are not authorized to update this user");
      error.statusCode = 403;
      throw error;
    }

    const userFields = ["name", "email"];
    const profileFields = ["age", "dob", "bio"];
    const userData = {};
    const profileData = {};
    for(const field of userFields){
      if(Object.prototype.hasOwnProperty.call(updateData, field)){
        userData[field] = updateData[field];
      }
    }
    for(const field of profileFields){
      if(Object.prototype.hasOwnProperty.call(updateData, field)){
        profileData[field] = updateData[field];
      }
    }

    if(Object.keys(userData).length === 0 && Object.keys(profileData).length === 0){
      const error = new Error("At least one valid profile field is required");
      error.statusCode = 400;
      throw error;
    }

    if(userData.email){
      userData.email = userData.email.trim().toLowerCase();
    }
    if(Object.keys(userData).length){
      await User.findByIdAndUpdate(id, userData, { runValidators: true });
    }
    if(Object.keys(profileData).length){
      const profile = await UserProfile.findOneAndUpdate(
        { user: id },
        { $set: profileData },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      await User.findByIdAndUpdate(id, { profile: profile._id });
    }

    return User.findById(id).populate("profile");
  }

  async softDelete(id, actor) {
    if(!mongoose.isValidObjectId(id)){
      const error = new Error("Invalid user ID");
      error.statusCode = 400;
      throw error;
    }
    const target = await User.findById(id);
    if(!target){
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    if(actor.role !== User.ROLES.FACULTY || target.role !== User.ROLES.STUDENT){
      const error = new Error("Only faculty can deactivate student accounts");
      error.statusCode = 403;
      throw error;
    }
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!user) {
      throw new Error("user not found");
    }
    return user;
  }

  async loginUser(email, password) {
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !user.isActive) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
    const payload = {
      id: user._id.toString(),
      email: user.email,
      isActive: user.isActive,
      role: user.role,
    };
    const token = jwtTokenService.generateToken(payload);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return { user: userWithoutPassword, token };
  }

async addUserProfile(userId, profileData){
    if(!mongoose.isValidObjectId(userId)){
        const error = new Error("Invalid user ID");
        error.statusCode = 400;
        throw error;

    }
    const user = await User.findOne({ _id: userId, isActive: true });
    if(!user){
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

   const newProfile = await UserProfile.create({
    user: userId,
    age: profileData.age,
    dob: profileData.dob,
    bio: profileData.bio,
   });
   user.profile = newProfile._id;
   await user.save();
   return newProfile;
}




}
module.exports = new UserService();
