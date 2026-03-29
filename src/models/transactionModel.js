const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'account', 
        required: true, 
        index: true
    }, 

    toAccount: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'account', 
        required: true, 
        index: true
    }, 

    status: {
        type: String, 
        enum: {
            values: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'], 
            message: 'Status can be either PENDING, FAILED or REVERSED'
        }, 
        default: 'PENDING'
    }, 

    amount: {
        type: Number, 
        required: true, 
        min: 0
    }, 

    idempotencyKey: {
        type: String, 
        required: true, 
        index: true, 
        unique: true
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;