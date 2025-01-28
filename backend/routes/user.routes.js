import express from "express"
import {
  createOrder,
  verifyPayment,
  viewBookingbyUser,
} from "../controllers/booking.controller.js"
import { MovieDetails, Movies } from "../controllers/movie.controller.js"
import { AddReview } from "../controllers/review.controller.js"
import { GetShowsByDate, ShowSeats } from "../controllers/show.controller.js"
import  {
  Logout,
  resendVerification,
  setup2FA,
  Signin,
  Signup,
  verify2FA,
  verifyEmail,
  checkUser,
  getUser,
} from "../controllers/user.controller.js"
import checkSeatStatus from "../middlewares/check-seat.middleware.js"
import authenticateUser from "../middlewares/user.middleware.js"
import rateLimit from "express-rate-limit"
import validateUserInput from "../middlewares/validaterequest.middleware.js"
import { loginSchema, userSchema } from "../validator/uservalidator.js"

const router = express.Router()

router.post("/signup",validateUserInput(userSchema) ,Signup)
router.post("/signin",rateLimit(15, 15 * 60 * 1000),validateUserInput(loginSchema), Signin)
router.post("/logout", Logout)
router.get("/check-user", checkUser)
router.get("/movies", Movies)
router.get("/movie-details/:id", authenticateUser, MovieDetails)
router.get("/shows", authenticateUser, GetShowsByDate)
router.get("/show-seats/:showId", authenticateUser, ShowSeats)

router.post("/create-order", authenticateUser, checkSeatStatus, createOrder)
router.post("/verify-payment", authenticateUser, verifyPayment)
router.get("/view-booking", authenticateUser, viewBookingbyUser)
router.post("/add-review", authenticateUser, AddReview)
router.get("/get-user", authenticateUser, getUser)
router.post('/setup-2fa', authenticateUser, setup2FA);
router.post('/verify-2fa', authenticateUser, verify2FA);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

//additional stat routes

export default router
