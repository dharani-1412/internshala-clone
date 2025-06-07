const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_EMAIL,     // your gmail
    pass: process.env.OTP_PASSWORD,  // app password (not real password)
  },
});

async function sendOtpEmail(to, otp) {
  const info = await transporter.sendMail({
    from: `"NullClass App" <${process.env.OTP_EMAIL}>`,
    to,
    subject: 'Your OTP Code',
    text: `Your login OTP is: ${otp}`,
    html: `<h3>Your login OTP is: <strong>${otp}</strong></h3>`,
  });

  console.log('OTP email sent:', info.messageId);
}

module.exports = { sendOtpEmail };
