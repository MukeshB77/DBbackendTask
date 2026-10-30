const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors')
require('dotenv').config();

const userRoutes = require('./routes/user.route.js');


const app = express();

app.use(express.json());
app.use(cors({
  origin:"*"
}));

app.use('/api/user',userRoutes);

const port = process.env.PORT



app.get('/',(req,res)=>{
    res.status(200).json({message:"App is running "});
});

connectDB().then(()=>{

app.listen(port,()=>{
    console.log(`server is running pn port ${port}`)
})

}).catch((err)=>{
    console.error('Failed to start server due to DB connection error',err.message);
    process.exit(1);
})












