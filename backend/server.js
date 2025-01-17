import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import mongoSanitize from "express-mongo-sanitize"
import session from "express-session"
import fs from "fs"
import helmet from "helmet"
import https from "https"
import morgan from "morgan"
import xssClean from "xss-clean"
import { connectToMongoDb } from "./config/db.js"
import { logUserActivity } from "./middlewares/logger.js"
import adminRoutes from "./routes/admin.routes.js"
import ownerRoutes from "./routes/owner.routes.js"
import userRoutes from "./routes/user.routes.js"

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

// HTTPS Configuration
const sslOptions = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
}

// Connect to MongoDB
connectToMongoDb()

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://localhost:3000"],
    credentials: true,
  })
)
//mongosanitize
app.use(
  mongoSanitize
  ({ replaceWith: "_" }))

//xssClean
app.use(
  xssClean())

app.use(morgan("dev"))
app.use(express.json())

app.use(
cookieParser())


app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  })
)

app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
)

// Enhanced cookie settings
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "sessionId",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    },
    resave: false,
    saveUninitialized: false,
  })
)

// Session cleanup middleware
const sessionCleanup = async (req, res, next) => {
  if (req.session && req.session.lastActivity) {
    const currentTime = Date.now()
    const inactivityPeriod = currentTime - req.session.lastActivity

    if (inactivityPeriod > 30 * 60 * 1000) {
      // 30 minutes
      await req.session.destroy()
      return res.status(440).json({ error: "Session expired" })
    }
    req.session.lastActivity = currentTime
  }
  next()
}

app.use(sessionCleanup)

// Routes
app.use("/api/user", userRoutes)
app.use("/api/owner", ownerRoutes)
app.use("/api/admin", adminRoutes)

app.get("/test", (req, res) => {
  res.send("Server running successfully")
})

// Start the Server
if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
} else {
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`)
  })
}

app.use(logUserActivity)

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", { error: error.stack })
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    reason,
    promise: promise.stack,
  })
})
