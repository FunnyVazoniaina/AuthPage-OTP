const bcrypt = require('bcryptjs');

class PasswordUtils {
    // Hash a password
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }
    // Compare a password with a hashed password
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

}
module.exports = PasswordUtils;