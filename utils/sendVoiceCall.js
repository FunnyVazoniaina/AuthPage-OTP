const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = async (phone, otp) => {
  try {
    // Split OTP digits for better voice clarity
    const otpDigits = otp.split('').join(', ');
    
    return await client.calls.create({
      twiml: `<Response><Say voice="alice" rate="slow">Hello, your verification code is: ${otpDigits}. I repeat, your verification code is: ${otpDigits}. This code will expire in 5 minutes.</Say></Response>`,
      to: phone,
      from: process.env.TWILIO_PHONE
    });
  } catch (error) {
    console.error('Voice call error:', error);
    throw new Error('Failed to make voice call');
  }
};
