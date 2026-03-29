const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String, 
        required: true, 
        unique: true
    }, 

    blacklistedAt: {
        type: Date, 
        default: Date.now, 
        immutable: true
    },    
}, { 
    timestamps: true 
});

tokenBlacklistSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 3 * 24 * 60 * 60
});

const tokenBlacklistModel = mongoose.model('tokenBlacklist', tokenBlacklistSchema);

module.exports = tokenBlacklistModel;