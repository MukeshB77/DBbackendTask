const jwt = require('jsonwebtoken');

require('dotenv').config();


class TokenService{
    generateToken(payload){
        const secretKey = process.env.JWT_SECRET;
        if(!secretKey){
            throw new Error("JWT_SECRET is not defined");
        }
        return jwt.sign(payload, secretKey,{expiresIn: "10h"})
    }
}

module.exports = new TokenService(); 
