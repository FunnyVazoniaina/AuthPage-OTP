const nodemailer = require('nodemailer');

module.exports = async (email, otp) => {
  try {
    // Configuration pour Gmail - CORRECTION: createTransport au lieu de createTransporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });
    //Email template
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '🔐 Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333;">🔐 Verification Code</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
              Your verification code is:
            </p>
            <div style="background-color: #007bff; color: white; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 5px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404;">
              ⏰ This code will expire in <strong>5 minutes</strong>
            </p>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; font-size: 14px; color: #666;">
            <p>If you didn't request this code, please ignore this email.</p>
            <p>For security reasons, never share this code with anyone.</p>
          </div>
        </div>
      `,
      text: `Your verification code is: ${otp}. This code will expire in 5 minutes.`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
    
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};
