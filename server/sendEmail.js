'use strict';
const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
var sendEmail = (toEmail,text,subject) => {
  return new Promise((resolve, reject) => {

    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_ID, // generated ethereal user
                pass: process.env.EMAIL_PASSWORD // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Request Raised" <letshelp@email.com>', // sender address
            to: toEmail, // list of receivers
            subject: subject, // Subject line
            text: 'a notification is here', // plain text body
            html: text // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              // console.log(error);
              return reject(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            resolve(text);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });

  })
}


module.exports = {sendEmail};
