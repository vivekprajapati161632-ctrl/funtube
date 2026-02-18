const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
};

const loadUser = async (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(payload.userId).select("-password");
  return user;
};

const protect = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await loadUser(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const optionalProtect = async (req, _res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const user = await loadUser(token);
    req.user = user || null;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};

module.exports = { protect, optionalProtect };
