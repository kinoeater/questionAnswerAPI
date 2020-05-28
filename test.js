const sendEmail = require("./helpers/libraries/sendEmail");
const asyncErrorWrapper = require("express-async-handler");


const sending = asyncErrorWrapper(async () => {

    await sendEmail({
        from : process.env.SMTP_USER,
        to: "mustafayol@gmail.com",
        subject: "Reset your Password", 
    
      });
      console.log("email sent");

 });

 sending();
