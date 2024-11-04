const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: [true, "'email' property required"],
    },
    password: {
        type: String,
        required: [true, "'password' property required"],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    imageLink: {
        type: String,
        default: "",
    },
});
module.exports = mongoose.model("User", userSchema);
