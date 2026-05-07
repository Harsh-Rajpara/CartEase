const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const indexRoutes = require("./routes/indexRoutes");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["https://cart-ease.vercel.app","http://localhost:3000"], 
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api", indexRoutes);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
