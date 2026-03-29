const userModel = require('../models/userModel.js');
const jwt = require('jsonwebtoken'); 
const emailService = require('../services/emailService.js');
const tokenBlacklistModel = require('../models/blacklistModel.js'); 

//User Register Controller
const userRegisterController = async (req, res) => {
    try{
        const { name, email, password } = req.body;

        const isExists = await userModel.findOne({ email });

        if(isExists){
            return res.status(400).json({
                success: false, 
                message: "Email already exists"
            });
        }

        const user = await userModel.create({
            name, email, password
        });

        const token = jwt.sign(
            {userId: user._id}, 
            process.env.JWT_SECRET, 
            {expiresIn: '3d'}
        );

        res.cookie("token", token, {
            httpOnly: true, 
            maxAge: 3 * 24 * 60 * 60 * 1000
        });

        await emailService.sendRegistrationEmail(user.email, user.name);

        return res.status(201).json({
            success: true, 
            message: "User Created!", 
            user
        });
    }

    catch(error){
        res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}


//User Login Controller
const userLoginController = async (req, res) => {
    try{
        const { email, password } = req.body; 

        const user = await userModel.findOne({ email }).select("+password");

        if(!user){
            return res.status(401).json({
                success: false, 
                message: "Invalid username or password!"
            });
        }

        const isValidPassword = await user.comparePassword(password);

        if(!isValidPassword){
            return res.status(401).json({
                success: false, 
                message: "Invalid username or password!"
            });
        }

        const token = jwt.sign(
            {userId: user._id}, 
            process.env.JWT_SECRET, 
            {expiresIn: '3d'}
        );

        res.cookie("token", token, {
            httpOnly: true, 
            maxAge: 3 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true, 
            message: "Login successful!", 
            user
        });
    }

    catch(error){
        res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}

//user logout controller
const userLogoutController = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    try{
        if(!token){
            return res.status(200).json({
                success: true, 
                message: 'User logged out'
            });
        }

        res.cookie("token", "");

        await tokenBlacklistModel.create({
            token: token
        });

        return res.status(200).json({
            success: true, 
            message: 'User logged out successfully'
        });
    }

    catch(error){
        res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    userRegisterController, 
    userLoginController, 
    userLogoutController
};