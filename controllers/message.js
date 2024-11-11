const Message = require("../models/Message");
const { isValidEmail } = require("../utils/validations");
const { isValidObjectId } = require("mongoose");

module.exports.getAllMessages = async (req, res, next) => {
    try {
        let foundMessages = await Message.find({});
        if (foundMessages.length < 1) {
            return res.status(200).send({ success: true, message: "No messages found.", messages: foundMessages });
        }
        return res.status(200).send({ success: true, message: "Messages retrieved.", messages: foundMessages });
    } catch (error) {
        next(error);
    }
};
module.exports.postMessage = async (req, res, next) => {
    try {
        let { name, email, message } = req.body;
        if (typeof email === "undefined" || typeof message === "undefined") {
            return res.status(400).send({ success: false, message: "Required inputs missing" });
        }
        if (typeof message !== "string") {
            return res.status(400).send({ success: false, message: "Invalid message" });
        }
        if (typeof email !== "string" || !isValidEmail(email)) {
            return res.status(400).send({ success: false, message: "Invalid email" });
        }
        if (typeof name !== "undefined" && typeof name !== "string") {
            return res.status(400).send({ success: false, message: "Invalid name" });
        }
        let newMessage = new Message({
            name: name,
            email: email,
            message: message,
        });
        let savedMessage = await newMessage.save();
        res.status(201).send({ success: true, message: "Message created.", message: savedMessage });
    } catch (error) {
        next(error);
    }
};
module.exports.markMessageAsRead = async (req, res, next) => {
    try {
        let { messageId } = req.params;
        if (typeof messageId === "undefined") {
            return res.status(400).send({ success: false, message: "Required inputs missing" });
        }
        if (!isValidObjectId(messageId)) {
            return res.status(404).send({ success: false, message: "No message found." });
        }
        let foundMessage = await Message.findById(messageId);
        if (!foundMessage) {
            return res.status(404).send({ success: false, message: "No message found." });
        }
        foundMessage.isRead = true;
        let updatedMessage = await foundMessage.save();
        res.status(200).send({ success: true, message: "Message updated successfully", message: updatedMessage });
    } catch (error) {
        next(error);
    }
};
