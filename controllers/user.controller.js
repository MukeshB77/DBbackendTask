const userServices = require("../services/user.services");


class UserController{
    async signup(req,res){
        try {
            
            const {name,email,password} = req.body;
         if(!name || !email || !password){
            return res.status(400).json({message:"All fields are required!"})
        }
        const result = await  userServices.signup(name,email,password);
        return res.status(201).json({message:"user created successfully",data:result})

        } catch (error) {
            console.log(error.message);
            return res.status(500).json({message:error.message})
            
        }
    }

      async getalluser(req,res){
        try {
            
        const result = await  userServices.getalluser();
        return res.status(200).json({
            count: result.length,
            message:"user fetched successfully",data:result})

        } catch (error) {
            console.log(error.message);
            return res.status(500).json({message:error.message})
            
        }
    }

      async getalluserWithoutPop(req,res){
        try {
            
        const result = await  userServices.getalluserWithoutPop();
        return res.status(200).json({
            count: result.length,
            message:"user fetched successfully",data:result})

        } catch (error) {
            console.log(error.message);
            return res.status(500).json({message:error.message})
            
        }
    }

    async getUserByQuery(req,res){
        try {
            
            const {name,email} =req.query;
            const result = await  userServices.getUserByQuery(name,email);

        return res.status(200).json({
            count: result.length,
            message:"user searched successfully",data:result})

        } catch (error) {
            console.log(error.message);
            return res.status(500).json({message:error.message})
            
        }
    }


     async updateUserById(req,res){
        try {    
            const {id}=req.params;
            const updateData = req.body;
            const result = await userServices.updateUserById(id,updateData);
        
        return res.status(200).json({
            // count: result.lengt,
            success: true,
            message:"user updated successfully", data:result })

        } catch (error) {
            console.log(error.message);
            return res.status(500).json({message:error.message})
        }
    }

    async softDelete(req,res){
        try {    
            const {id}=req.params;
            const result = await userServices.softDelete(id); 
        return res.status(200).json({
            // count: result.lengt,
            success: true,
            message:"user soft  deleted successfully", data:result })

        } catch (error) {
            console.log(error.message);
            return res.status(500).json({message:error.message})
        }
    }

     async login(req,res){
        try {
            
            const {email,password} = req.body;
         if( !email || !password){
            return res.status(400).json({message:"All fields are required!"})
        }


        const loginData = await  userServices.loginUser(email,password);
        return res.status(201).json({message:"user logined successfully",data:loginData})

        } catch (error) {
            console.log(error.message);
            return res.status(401).json({message:error.message})
            
        }
    }

     async addUserProfile(req,res){
        try {
            
            const userId = req.user.id;
            const {age, dob, bio} = req.body;
         if(!userId){
            return res.status(400).json({message:"User ID is required"});
        }


        const newUserProfile = await  userServices.addUserProfile(userId,{age,dob,bio});
        return res.status(201).json(
            {message:"user profile added  successfully",data:
            newUserProfile})

        } catch (error) {
             if (error.code === 11000){
                return res.status(409).json({message:"Profile for this user is already existed"})
             }
           

            console.log(error.message);
            return res.status(400).json({message:error.message})
            
        }
    }

    


    
   
}
 module.exports = new UserController;