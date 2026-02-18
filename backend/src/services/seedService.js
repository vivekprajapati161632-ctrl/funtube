const User = require("../models/User");

const ensureAdminUser = async () => {
  const adminEmail = "admin@funtube.local";
  const adminUsername = "Admin";
  const adminPassword = "1234";

  const existing = await User.findOne({ email: adminEmail });
  if (existing) return;

  await User.create({
    username: adminUsername,
    email: adminEmail,
    password: adminPassword,
    role: "admin",
    channelDescription: "Official admin channel"
  });

  console.log("Seeded default admin user: Admin / 1234");
};

module.exports = { ensureAdminUser };
