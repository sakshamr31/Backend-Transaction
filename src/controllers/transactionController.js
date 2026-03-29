const transactionModel = require('../models/transactionModel.js');
const ledgerModel = require('../models/ledgerModel.js');
const emailService = require('../services/emailService.js');
const accountModel = require('../models/accountModel.js');
const mongoose = require('mongoose');

//Create a new transaction
/* 
    THE 10-STEP TRANSFER FLOW:
        1. Validate request
        2. Validate idempotency key
        3. Check account status
        4. Derive sender balance from ledger
        5. Create transaction (PENDING)
        6. Create DEBIT ledger entry
        7. Create CREDIT ledger entry
        8. Mark transaction COMPLETED
        9. Commit MongoDB session
        10. Send email notification
*/
const createTransaction = async (req, res) => {

    //validate request
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            success: false, 
            message: 'Required fields missing!'
        });
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount });

    const toUserAccount = await accountModel.findOne({ _id: toAccount });

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            success: false, 
            message: 'Invalid information'
        });
    }

    //validate idempotency key
    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey: idempotencyKey });

    if(isTransactionAlreadyExists){

        if(isTransactionAlreadyExists.status === 'COMPLETED'){
            return res.status(200).json({
                success: true, 
                message: 'Transaction already processed'
            });
        }

        if(isTransactionAlreadyExists.status === 'PENDING'){
            return res.status(200).json({
                success: true, 
                message: 'Transaction is still in process'
            });
        }

        if(isTransactionAlreadyExists.status === 'FAILED'){
            return res.status(500).json({
                success: false, 
                message: 'Transaction failed, please try again!'
            });
        }

        if(isTransactionAlreadyExists.status === 'REVERSED'){
            return res.status(500).json({
                success: false, 
                message: 'Transaction was reversed, please retry!'
            });
        }
    }

    //check amount status
    if(fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE'){
        return res.status(500).json({
            success: false, 
            message: 'Accounts must be ACTIVE to process transaction'
        });
    }

    //derive sender balance from ledger
    const balance = await fromUserAccount.getBalance();

    if(balance < amount){
        return res.status(400).json({
            success: false, 
            message: 'Insufficient balance'
        });
    }

    //create transaction (pending)
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount, 
        toAccount, 
        amount, 
        idempotencyKey, 
        status: 'PENDING'
    });

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromAccount, 
        amount: amount, 
        transaction: transaction._id, 
        type: 'DEBIT'
    } ], { session }); 

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount, 
        amount: amount, 
        transaction: transaction._id, 
        type: 'CREDIT'
    } ], { session });

    transaction.status = 'COMPLETED';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    //send email notification
    await emailService.sendTransactionSuccessEmail(req.user.email, req.user.name, amount, toAccount);

    return res.status(201).json({
        success: true, 
        message: 'Transaction completed successfully', 
        transaction: transaction
    });
}


const createInitialFundsTransaction = async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body; 

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            success: false, 
            message: 'All fields required'
        });
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount }); 

    if(!toUserAccount){
        return res.status(400).json({
            success: false, 
            message: 'Invalid toAccount'
        });
    }

    const fromUserAccount = await accountModel.findOne({ user: req.user._id });

    if(!fromUserAccount){
        return res.status(400).json({
            success: false,
            message: 'System User Account not found'
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id, 
        toAccount, 
        amount, 
        idempotencyKey, 
        status: 'PENDING'
    });

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id, 
        amount: amount, 
        transaction: transaction._id, 
        type: 'DEBIT'
    } ], { session });

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount, 
        amount: amount, 
        transaction: transaction._id, 
        type: 'CREDIT'
    } ], { session });

    transaction.status = 'COMPLETED', 
    await transaction.save({ session });

    await session.commitTransaction(); 
    session.endSession();

    return res.status(201).json({
        success: true, 
        message: 'Intitial funds transaction completed successfully!', 
        transaction
    });
}

module.exports = {
    createTransaction, 
    createInitialFundsTransaction
}
