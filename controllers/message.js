const Message = require("../models/Message");
const { errorHandler } = require("../utils");
const { isValidEmail } = require("../validations");
const { isValidObjectId } = require("mongoose");

module.exports.getAllMessages = async (req, res) => {
    let log = { name: "getAllMessages", variables: {} };
    req.log.middlewares.push(log);
    try {
        let foundMessages = await Message.find({});
        log.variables["foundMessages"] = foundMessages;
        if (foundMessages.length < 1) {
            log.variables["message"] = "200 No messages found.";
            return res.status(200).send({ success: true, message: "No messages found.", messages: foundMessages });
        }
        log.variables["message"] = "200 Messages retrieved.";
        return res.status(200).send({ success: true, message: "Messages retrieved.", messages: foundMessages });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.postMessage = async (req, res) => {
    let log = { name: "postMessage", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { name, email, message } = req.body;
        if (typeof email === "undefined" || typeof message === "undefined") {
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (typeof message !== "string") {
            log.variables["message"] = "400 Invalid message";
            return res.status(400).send({ error: "Invalid message" });
        }
        if (typeof email !== "string" || !isValidEmail(email)) {
            log.variables["message"] = "400 Invalid email";
            return res.status(400).send({ error: "Invalid email" });
        }
        if (typeof name !== "undefined" && typeof name !== "string") {
            log.variables["message"] = "400 Invalid name";
            return res.status(400).send({ error: "Invalid name" });
        }
        let newMessage = new Message({
            name: name,
            email: email,
            message: message,
        });
        let savedMessage = await newMessage.save();
        log.variables["savedMessage"] = savedMessage;
        log.variables["message"] = "201 Message created.";
        res.status(201).send({ success: true, message: "Message created.", message: savedMessage });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.readMessage = async (req, res) => {
    let log = { name: "postMessage", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { messageId } = req.params;
        if (typeof messageId === "undefined") {
            log.variables["message"] = "400 Required inputs missing";
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (!isValidObjectId(messageId)) {
            log.variables["message"] = "404 Invalid Object ID.";
            return res.status(404).send({ error: "No message found." });
        }
        let foundMessage = await Message.findById(messageId);
        log.variables["foundMessage"] = foundMessage;
        if (!foundMessage) {
            log.variables["message"] = "404 No message found.";
            return res.status(404).send({ error: "No message found." });
        }
        foundMessage.isRead = true;
        let updatedMessage = await foundMessage.save();
        log.variables["updatedMessage"] = updatedMessage;
        log.variables["message"] = "200 Message updated.";
        res.status(200).send({ success: true, message: "Message updated successfully", message: updatedMessage });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
