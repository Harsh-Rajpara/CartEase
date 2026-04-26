// // require("dotenv").config({quiet:true});

// const express = require("express");
// const indexRoutes = require("./routes/indexRoutes");
// // const connectDB = require("./config/db");
// const app = express();

// // connectDB();

// app.use(express.json());

// app.use("/api", indexRoutes);

// // app.listen(process.env.PORT, () => {
// //     console.log(`Server started on ${process.env.PORT}`);
// // })
// module.exports = app;

// backend/app.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const indexRoutes = require("./routes/indexRoutes");

const app = express();

// ✅ Enable CORS for frontend
app.use(
  cors({
    origin: ["http://localhost:3000", "https://your-frontend.vercel.app"], // Your React frontend URL
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ Parse JSON bodies
app.use(express.json());

// ✅ Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ✅ Parse cookies
app.use(cookieParser());

// ✅ API Routes
app.use("/api", indexRoutes);

// ✅ Health check endpoint (for testing)
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ✅ 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
