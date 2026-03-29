require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});


// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server: ', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Transaction" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


//Send registration email
const sendRegistrationEmail = async (userEmail, name) => {
    const subject = 'Welcome to Backend Transaction!'; 

    const text = `Hello ${name}, \n \n Thank you for registering at Backend Transaction. We are excited to have you on board! \n \n Best Regards, \n The Backend Transaction Team`; 

    const html = `<p>Hello ${name}, </p>
    <p>Thank you for registering at Backend Transaction.</p>
    <p>We are excited to have you on board!</p>
    <p><strong>Best Regards,</strong><br>The Backend Transaction Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}


//Send successfull transaction email
const sendTransactionSuccessEmail = async (userEmail, name, amount, toAccount) => {
  const subject = 'Transaction Successfull!'; 

  const text = `Hello ${name}, \n \n Your transaction of $${amount} to account ${toAccount} was successfull. \n \n Best regards, \n The Backend Transaction Team.`; 

  const html = `<p>Hello ${name},</p>
  <p>Your transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> was successfull.</p>
  <p><strong>Best regards,</strong><br/>The Backend Transaction Team</p>`;

  await sendEmail(userEmail, name, amount, toAccount);
}


//Send failure transaction email
const sendTransactionFailureEmail = async (userEmail, name, amount, toAccount) => {
  const subject = 'Transaction Failed!'; 

  const text = `Hello ${name}, \n \n Your transaction of $${amount} to account ${toAccount} was failed. \n \n Best regards, \n The Backend Transaction Team.`; 

  const html = `<p>Hello ${name},</p>
  <p>Your transaction of <strong>$${amount}</strong> to account <strong>${toAccount}</strong> was failed.</p>
  <p><strong>Best regards,</strong><br/>The Backend Transaction Team</p>`;

  await sendEmail(userEmail, name, amount, toAccount);
}

module.exports = {
    sendEmail, 
    sendRegistrationEmail , 
    sendTransactionSuccessEmail, 
    sendTransactionFailureEmail
};

// module.exports = transporter;