const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const escalateRoutes = require("./routes/escalateRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "zt-chatbot-server",
    status: "running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/escalate", escalateRoutes);
app.use(errorHandler);

connectDB(process.env.MONGODB_URI).finally(() => {
  app.listen(PORT, () => {
    console.log(`ZT Chatbot server running on port ${PORT}`);
  });
});
