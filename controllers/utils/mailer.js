import nodemailer from "nodemailer"

export async function resetMail(user) {
  try {
      const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false,
          requireTLS: true,
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
          tls: {
              rejectUnauthorized: false ,
          }
      });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Forget password',
          html: `Dear ${user.firstName} ${user.lastName},<br><br>
            Your One-Time Password (OTP) for password reset is: <strong>${user.otp}</strong>.<br><br>
            Please use this code to complete the password reset process. If you didn't request this change, please ignore this email.<br><br>
            Best regards,<br>
            The UniJob Team`
      };

      transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log(error);
          } else {
              console.log('Email sent: ' + info.response);
          }
      });
  } catch (error) {
      console.error(error);
      // Gérer l'erreur
  }
}

// Fonction pour envoyer un email de notification de rejet
export async function rejectApplication(jobSeeker, jobOffer) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        }
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: jobSeeker.email,
        subject: 'Job Application Update',
        html: `
          <p>Dear ${jobSeeker.firstName} ${jobSeeker.lastName},</p>
  
          <p>Thank you for taking the time to apply for the <strong>${jobOffer.title}</strong> position at our company. We appreciate your interest in joining our team and the effort you put into your application.</p>
  
          <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match the requirements of this position. This decision was not easy, as we received applications from many qualified individuals.</p>
  
          <p>We want to thank you for your interest in UniJob and encourage you to keep an eye on our career page for future openings. We are constantly looking for talented and dedicated professionals, and we would welcome your application for other roles that align with your skills and experience.</p>
  
          <p>If you have any questions or would like feedback on your application, please do not hesitate to reach out to us.</p>
  
          <p>Thank you once again for considering a career with us, and we wish you all the best in your job search and future professional endeavors.</p>
  
          <p>Best regards,<br>
          The UniJob Team</p>
        `
      };  
      await transporter.sendMail(mailOptions);
      console.log('Rejection email sent to: ' + jobSeeker.email);
      console.log('job offer title'+jobOffer.title);
    } catch (error) {
      console.error('Error sending rejection email:', error);
    }
  }