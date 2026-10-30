const jwt = require('jsonwebtoken');

require('dotenv').config();


const secretKey = process.env.JWT_SECRET;

class TokenService{
    generateToken(payload){
        return jwt.sign(payload, secretKey,{expiresIn: "10h"})
    }
}

module.exports = new TokenService(); 
