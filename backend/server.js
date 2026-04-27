import express from "express";
import cors from "cors";
import chatbotRoutes from "./routes/chatbotRoutes.js";

const app = express();
const preferredPort = Number(process.env.PORT) || 5001;
const allowedOrigins = new Set(["http://localhost:5175"]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: false,
  }),
);
app.use(express.json());
app.use(chatbotRoutes);

const server = app.listen(preferredPort, () => {
  console.log(`Kairos backend listening on port ${preferredPort}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${preferredPort} is already in use. Stop the other server or start this one with a different PORT.`,
    );
    return;
  }

  console.error("Backend server failed to start.", error);
});
