const sendEmail = require('../utils/sendEmail');
require('dotenv').config();

async function testEmail() {
    try {
        console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
        
        const result = await sendEmail('funnyvazoniaina@gmail.com', '123456');
        console.log('Test réussi:', result);
    } catch (error) {
        console.error('Erreur de test:', error);
    }
}

testEmail();
