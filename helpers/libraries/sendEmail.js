const nodemailer = require("nodemailer");

const sendEmail = async (mailOptions) => {

    console.log( process.env.SMTP_HOST);
    console.log(process.env.SMTP_PORT);
    console.log(process.env.SMTP_USER);
    console.log(process.env.SMTP_PASS);
    
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
        
    });

    let info = await transporter.sendMail(mailOptions);
    console.log(`Message Sent: ${info.messageId}`);

};

module.exports = sendEmail;
