const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

module.exports = async (phone, otp) => {
  return await client.messages.create({
    body: `Your OTP is: ${otp}`,
    to: phone,
    from: process.env.TWILIO_PHONE
  });
};
