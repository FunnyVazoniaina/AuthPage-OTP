const crypto = require('crypto');

const generateOtp = () => {
  try {
    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Vérification que l'OTP a bien 6 chiffres
    if (otp.length !== 6) {
      // Fallback si crypto.randomInt ne fonctionne pas comme attendu
      const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Using fallback OTP generation');
      return fallbackOtp;
    }
    
    console.log('Generated OTP:', otp);
    return otp;
  } catch (error) {
    console.error('Error generating OTP with crypto.randomInt:', error);
    
    // Fallback method using Math.random
    const fallbackOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Using fallback OTP generation due to error');
    return fallbackOtp;
  }
};

module.exports = generateOtp;
