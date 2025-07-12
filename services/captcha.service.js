const axios = require('axios');

const verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const url = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(url, null, {
      params: {
        secret,
        response: token,
      },
    });

    return response.data.success;
  } catch (error) {
    console.error("Erreur reCAPTCHA:", error.message);
    return false;
  }
};

module.exports = { verifyRecaptcha };
