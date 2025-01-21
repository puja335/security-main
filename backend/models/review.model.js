import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    review: {
        type: String,
        default : null,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;