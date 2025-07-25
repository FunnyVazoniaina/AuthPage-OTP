const twilio = require('twilio');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

module.exports = async (phone, otp) => {
  try {
    console.log('Attempting to send SMS...');
    console.log('Phone number received:', phone);
    console.log('OTP:', otp);
    console.log('Twilio SID:', process.env.TWILIO_SID);
    console.log('Twilio Auth Token (first 10 chars):', process.env.TWILIO_AUTH_TOKEN?.substring(0, 10) + '...');
    
    const senderName = process.env.TWILIO_SENDER_NAME || 'AuthPageOTP';
    console.log('Sender Name:', senderName);

    // Validation des paramètres
    if (!phone || !otp) {
      throw new Error('Phone number and OTP are required');
    }

    // Formatage du numéro de téléphone pour Madagascar
    let formattedPhone = phone.toString().trim();
    
    // Supprimer les espaces et caractères spéciaux
    formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
    
    // Formatage selon les standards malgaches
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        // 034 123 45 67 -> +261341234567
        formattedPhone = '+261' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('261')) {
        // 261341234567 -> +261341234567
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.startsWith('3') && formattedPhone.length === 9) {
        // 341234567 -> +261341234567
        formattedPhone = '+261' + formattedPhone;
      } else {
        // Par défaut, ajouter le code pays de Madagascar
        formattedPhone = '+261' + formattedPhone;
      }
    }

    console.log('Formatted phone number:', formattedPhone);

    const messageBody = `Votre code de vérification est: ${otp}. Ce code expire dans 5 minutes.`;
    
      const message = await client.messages.create({
      body: messageBody,
      to: formattedPhone,
      from: senderName // Utilisation du nom d'expéditeur alphanumérique au lieu de TWILIO_PHONE
    });

    console.log('SMS sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Message status:', message.status);
    
    return message;
  } catch (error) {
    console.error('SMS sending error details:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('More info:', error.moreInfo);
    
    
    
  }
};
