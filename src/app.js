const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes.js');
const accountRouter = require('./routes/accountRoutes.js');
const transactionRoutes = require('./routes/transactionRoutes.js');

const app = express();

app.use(express.json());
app.use(cookieParser()); 

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRoutes);

module.exports = app;