const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const { ensureAdminUser } = require("./services/seedService");

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    await connectDB();
    await ensureAdminUser();

    app.listen(port, () => {
      console.log(`FunTube backend listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

startServer();
