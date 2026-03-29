const userModel = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklistModel.js');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({
            success: false, 
            message: "Unauthorized access"
        });
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token });

    if(isBlacklisted){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized access, invalid token'
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId);

        req.user = user; 

        return next();
    }

    catch(error){
        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}


const authSystemUserMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({
            success: false, 
            message: "Unauthorized access"
        });
    }

    const isBlacklisted = await tokenBlacklistModel.findOne({ token });

    if(isBlacklisted){
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized access, invalid token'
        });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select('+systemUser');

        if(!user.systemUser){
            return res.status(403).json({
                message: 'Forbidden access, not a system user'
            });
        }

        req.user = user; 

        return next();
    }

    catch(error){
        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    authMiddleware, 
    authSystemUserMiddleware
};