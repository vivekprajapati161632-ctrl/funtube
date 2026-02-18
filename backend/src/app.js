const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const channelRoutes = require("./routes/channelRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const videoRoutes = require("./routes/videoRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "funtube-backend"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
