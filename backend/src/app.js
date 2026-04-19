const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const batchRoutes = require("./routes/batchRoutes");
const batchVerificationRoutes = require("./routes/batchVerificationRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "");

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_BASE_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes("*")) {
    return true;
  }

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Allow wildcard origin values such as *.vercel.app
  return allowedOrigins.some((allowed) => {
    if (!allowed.startsWith("*.")) {
      return false;
    }

    return normalizedOrigin.endsWith(allowed.slice(1));
  });
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS blocked for this origin."));
    },
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Sanitize MongoDB operators in request body & params ──────────────────────
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  next();
});

// ── Rate limiters ─────────────────────────────────────────────────────────────

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { message: "Too many verification requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Volkschem QR API" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/batch", verifyLimiter, batchVerificationRoutes);

// ── Error handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
