const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");

const shapeAuthResponse = (user) => ({
  token: signToken(user._id),
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    channelDescription: user.channelDescription
  }
});

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required" });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });
    return res.status(201).json(shapeAuthResponse(user));
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: "loginId and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: loginId.toLowerCase() }, { username: loginId }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let isMatch;
    if (user.password && user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      if (isMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json(shapeAuthResponse(user));
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  me
};
