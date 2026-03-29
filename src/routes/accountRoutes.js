const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware.js');
const accountController = require('../controllers/accountController.js');

const router = express.Router();

//create a new account
router.post('/', authMiddleware.authMiddleware, accountController.createAccountController);

//get all accounts of logged-in user
router.get('/', authMiddleware.authMiddleware, accountController.getUserAccountsController);

//get balance of an account id
router.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getAccountBalanceController);

module.exports = router;