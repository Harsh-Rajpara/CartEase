const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },

  family: 4, // FORCE IPv4

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

exports.sendOTPByEmail = async (email, otp) => {
  try {
    console.log("Sending email to:", email);

    const info = await transporter.sendMail({
      from: `"CartEase" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>OTP Verification</h2>
        <h1>${otp}</h1>
      `,
    });

    console.log("EMAIL SENT");
    console.log(info);

  } catch (error) {
    console.log("FULL EMAIL ERROR:");
    console.log(error);

    throw new Error("Email failed");
  }
};