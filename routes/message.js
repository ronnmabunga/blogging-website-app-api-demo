const express = require("express");
const messageController = require("../controllers/message");
const { verifyToken, verifyAdminToken } = require("../utils");
const router = express.Router();
router.get("/", verifyToken, verifyAdminToken, messageController.getAllMessages);
router.post("/", messageController.postMessage);
router.patch("/:messageId", verifyToken, verifyAdminToken, messageController.readMessage);
module.exports = router;
