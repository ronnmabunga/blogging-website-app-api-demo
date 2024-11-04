const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "'title' property required"],
    },
    posterId: {
        type: String,
        required: [true, "'posterId' property required"],
    },
    posterEmail: {
        type: String,
        required: [true, "'posterEmail' property required"],
    },
    content: {
        type: String,
        default: "",
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    comments: {
        type: [
            {
                commenterId: {
                    type: String,
                    default: "Anonymous",
                },
                commenterEmail: {
                    type: String,
                    default: "Anonymous",
                },
                comment: {
                    type: String,
                    required: [true, "'comment' property required"],
                },
                creationDate: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        default: [],
    },
});
module.exports = mongoose.model("Blog", blogSchema);
