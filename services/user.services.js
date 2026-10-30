const User = require("../models/user.model");
const UserProfile = require("../models/user.profile.model");
const bcrypt = require("bcrypt");
const jwtTokenService = require("../jwt/token.service");
const { default: mongoose } = require("mongoose");


class UserService {
  async signup(name, email, password) {
    const hashpass = await bcrypt.hash(String(password), 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exist");
    }

    const user = await User.create({ name, email, password: hashpass });
    return user;
  }

  async getalluser() {
    const users = await User.find({ isActive: true})
    .populate("profile");
    const userIds = users.map((user)=> user._id);
    console.log(userIds,'///')
    const userProfiles = await UserProfile.find({ user: { $in : userIds}})
    console.log(userProfiles,"Userprofile data list")


    return users;
  }

 async getalluserWithoutPop() {
    const users = await User.find({ isActive: true});
    const userIds = users.map((user)=> user._id);
    console.log(userIds,'///')
    const userProfiles = await UserProfile.find({ user: { $in : userIds}})
    console.log(userProfiles,"Userprofile data list")

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
    const filter = {};
    if (name) {
      filter.name = name;
    }
    if (email) {
      filter.email = email;
    }
    const users = await User.find(filter);
    return users;
  }

  async updateUserById(id, updateData) {
    const data = { ...updateData };
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      throw new Error("user not found");
    }
    return user;
  }

  async softDelete(id) {
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
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("User not found");
    }
     if (!user.isActive) {
      throw new Error("User is InActive");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    const payload = {
      id: user._id,
      email: user.email,
      isActive: user.isActive,
    };
    const token = jwtTokenService.generateToken(payload);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return { user: userWithoutPassword, token };
  }

async addUserProfile(userId, profileData){
    if(!mongoose.isValidObjectId(userId)){
        throw new Error("Invalid user ID");

    }
    const user = await User.findById(userId);
    if(!user){
        throw new Error("User not Found");
    }

   const newProfile = await UserProfile.create({
    user: userId,
    age: profileData.age,
    dob: profileData.dob,
    bio: profileData.bio,
   });
   user.profile = newProfile._id;
   await user.save();
   return userProfile;
}




}
module.exports = new UserService();
