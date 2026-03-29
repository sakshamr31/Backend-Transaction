const express = require('express');
const transactionController = require('../controllers/transactionController.js');
const { authMiddleware, authSystemUserMiddleware } = require('../middlewares/authMiddleware.js');

const transactionRoutes = express.Router();

transactionRoutes.post('/', authMiddleware, transactionController.createTransaction);
transactionRoutes.post('/system/initial-funds', authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

module.exports = transactionRoutes;