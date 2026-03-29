const mongoose = require('mongoose');

const connectToDB = () => {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Database Connected!");
    })
    .catch(error => {
        console.log("Error connecting to database");
        process.exit(1);
    });
} 

module.exports = connectToDB;