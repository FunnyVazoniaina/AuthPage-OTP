const User = require("../models/User");
const {
  generateOtp,
  sendEmail,
  generateToken,
  passwordUtils,
} = require("../utils");
const { verifyRecaptcha } = require("./captcha.service");

class AuthService {
  static async register(username, password, email) {
    if (!username || !password || !email) {
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("Username already exists");
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
      );
    }
    const hashedPassword = await passwordUtils.hashPassword(password);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      isVerified: false,
      mfaEnabled: false,
      otp: "",
      otpExpiresAt: null,
    });
    await user.save();
    return {
      token: generateToken({ id: user._id, username: user.username }),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  static async login(username, password, recaptchaToken) {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("user not found");
    }

    const isMatch = await passwordUtils.comparePassword(
      password,
      user.password,
    );
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res
        .status(403)
        .json({ message: "Échec de vérification reCAPTCHA" });
    }

    return {
      token: generateToken({ id: user._id, username: user.username }),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  static async sendOtp(userId, method) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    if (method === "email") {
      if (!user.email) {
        throw new Error("Email is required for email OTP");
      }
      await sendEmail(user.email, otp);
    } else if (method === "sms") {
      if (!user.phone) {
        throw new Error("Phone number is required for SMS OTP");
      }
      await sendSms(user.phone, `Your OTP code is: ${otp}`);
    } else if (method === "voice") {
      if (!user.phone) {
        throw new Error("Phone number is required for voice OTP");
      }
      await sendVoiceCall(user.phone, `Your OTP code is: ${otp}`);
    } else {
      throw new Error("Invalid OTP method");
    }
    return { message: "OTP sent successfully" };
  }

  static async verifyOtp(userId, otp) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
      throw new Error("Invalid or expired OTP");
    }
    user.otp = "";
    user.otpExpiresAt = null;
    user.isVerified = true;
    await user.save();
    return { message: "OTP verified successfully", userId: user._id };
  }
}
module.exports = AuthService;
