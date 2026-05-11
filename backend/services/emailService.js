const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,      
    pass: process.env.EMAIL_PASS    
  }
});

exports.sendOTPByEmail  = async (email, otp) => {
  try {
     console.log("Sending email to:", email);
      console.log("Sending otp to:", otp);

    // await transporter.sendMail({
    //   from: `"CartEase" <${process.env.EMAIL}>`,
    //   to: email,
    //   subject: "Your OTP Code",
    //   html: `
    //     <h2>OTP Verification</h2>
    //     <p>Your OTP is:</p>
    //     <h1>${otp}</h1>
    //     <p>This OTP will expire in 5 minutes.</p>
    //   `
    // });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.log("error", error);
    console.error("Email send error:", error.message);
    throw new Error("Email failed");
  }
};