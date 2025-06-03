module.exports = async (phone, otp) => {
  return await client.calls.create({
    twiml: `<Response><Say>Your one time password is ${otp}</Say></Response>`,
    to: phone,
    from: process.env.TWILIO_PHONE
  });
};
