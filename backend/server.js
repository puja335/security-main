import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan"
import connectToMongoDB from "./config/db.js"
import adminRoutes from "./routes/admin.routes.js"
import ownerRoutes from "./routes/owner.routes.js"
import userRoutes from "./routes/user.routes.js"

dotenv.config()
const PORT = process.env.PORT || 7895
const app = express()

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5175"],
    credentials: true,
  })
)
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(express.static("uploads"))

//routes
app.use("/api/user", userRoutes)
app.use("/api/owner", ownerRoutes)
app.use("/api/admin", adminRoutes)

app.use("/", (req, res) => {
  res.send("server running successfully")
})

app.listen(PORT, () => {
  connectToMongoDB()
  console.log("Server is running at http://localhost:" + PORT)
})
