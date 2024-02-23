import nodemailer from "nodemailer"

export async function  resetMail(user){
    try{
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false,
          requireTLS:true,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          }
       });
       const mailOptions ={
              from: process.env.EMAIL_USER,
              to: user.email,
              subject: 'Forget password',
              text: `Dear ${user.firstName} ${user.lastName},\n\nYour One-Time Password (OTP) for password reset is: <strong>${user.otp}</strong>.\n\nPlease use this code to complete the password reset process. If you didn't request this change, please ignore this email.\n\nBest regards,\nThe UniJob Team`,
              
             
          }
          transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
      }catch(error){
          res.status(400).send({success :false,msg:error.message});
      }
      
      }

      