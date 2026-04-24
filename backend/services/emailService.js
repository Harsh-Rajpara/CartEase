const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,        // your gmail
    pass: process.env.EMAIL_PASS    // app password
  }
});

exports.sendOTPByEmail  = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"CartEase" <${process.env.EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw new Error("Email failed");
  }
};