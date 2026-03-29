const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: [true, "Email is required to create the user"], 
        trim: true, 
        lowercase: true, 
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email address"], 
        unique: true,
    }, 

    name: {
        type: String, 
        required: [true, "Name is required to create the account"],
    }, 

    password: {
        type: String, 
        required: [true, "Password is required to create an account"],
        minlength: 6, 
        select: false
    }, 

    systemUser: {
        type: Boolean, 
        default: false, 
        immutable: true, 
        select: false
    }
}, {
    timestamps: true
});

userSchema.pre("save", async function(){
    try{
        if(!this.isModified("password")){
            return;
        }

        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;

        return;
    }

    catch(error){
        throw error;
    }
});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;