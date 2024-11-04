const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "'email' property required"],
    },
    message: {
        type: String,
        required: [true, "'message' property required"],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
});
module.exports = mongoose.model("Message", messageSchema);
