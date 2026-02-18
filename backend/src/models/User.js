const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 4
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    avatarUrl: {
      type: String,
      default: ""
    },
    channelDescription: {
      type: String,
      default: "Welcome to my channel"
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plainText) {
  if (!this.password || !this.password.startsWith("$2")) {
    return Promise.resolve(this.password === plainText);
  }
  return bcrypt.compare(plainText, this.password);
};

module.exports = mongoose.model("User", userSchema);
