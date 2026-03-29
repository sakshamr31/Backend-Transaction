const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'account', 
        required: true, 
        index: true, 
        immutable: true
    }, 

    amount: {
        type: Number, 
        required: true, 
        immutable: true
    }, 

    transaction: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'transaction', 
        required: true, 
        index: true, 
        immutable: true
    }, 

    type: {
        type: String, 
        enum: {
            values: ['CREDIT', 'DEBIT'], 
            message: 'Type can be either CREDIT or DEBIT'
        }, 
        required: true, 
        immutable: true
    }
});

const preventLedgerModification = () => {
    throw new Error('Ledger entries can not be modified or deleted');
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;