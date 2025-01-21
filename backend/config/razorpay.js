import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config()

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_8d4p8fJ8z1Qh3T',
  key_secret: process.env.RAZORPAY_SECRET
});

export default razorpayInstance;