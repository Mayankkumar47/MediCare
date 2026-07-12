import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/api.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Express Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    const allowed = [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean);
    // Also allow any *.onrender.com domain dynamically
    if (allowed.includes(origin) || /\.onrender\.com$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error("CORS: origin not allowed - " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic upload URLs response transformer middleware
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const isPlainObject = (val) => val && (Object.getPrototypeOf(val) === null || Object.getPrototypeOf(val) === Object.prototype);

    const replaceUrl = (obj) => {
      if (!obj) return obj;
      if (typeof obj === 'string') {
        if (obj.includes('localhost:4000/uploads/')) {
          return obj.replace(/http:\/\/localhost:4000/g, baseUrl);
        }
        if (obj.startsWith('/uploads/') || obj.startsWith('uploads/')) {
          const clean = obj.startsWith('/') ? obj : `/${obj}`;
          return `${baseUrl}${clean}`;
        }
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(replaceUrl);
      }
      if (isPlainObject(obj)) {
        const newObj = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = replaceUrl(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    };

    const transformedData = replaceUrl(data);
    return oldJson.call(this, transformedData);
  };
  next();
});

// Ensure public upload directories exist
const uploadDir = "./public/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "MediCare API Service is running." });
});

// Register API Routes
app.use("/api", apiRoutes);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});
