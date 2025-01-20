import mongoose from "mongoose";

export const connectToMongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("DB connected successfully");
  } catch (err) {
    console.error("Error connecting to DB:", err);
    process.exit(1); // Exit the process if the connection fails
  }
};
