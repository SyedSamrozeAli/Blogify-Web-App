import mongoose from "mongoose";

const commentsSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    madeBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: true,
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blog",
        require: true,
    }
}, { timestamps: true });

const commentsModel = mongoose.model("comments", commentsSchema);
export default commentsModel;