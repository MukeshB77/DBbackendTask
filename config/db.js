const mongoose = require('mongoose');

const connectDB=async()=>{
    const MONGO_URL= process.env.MONGODB_URL;

    if (!MONGO_URL){
        console.error('Error: No MONGO_URL is defined in your environment(.env)')
        process.exit(1);
    }

    try{
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB successfully');
    }catch(err){
        console.error('Failed to connect to MondoDB:',err.message);
        process.exit(1);
    } 
};

module.exports=connectDB;