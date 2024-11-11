const express = require("express");
const messageController = require("../controllers/message");
const { decodeToken } = require("../utils/authentication");
const { validateAdminBFAC } = require("../utils/authorization");
const router = express.Router();
router.get("/", decodeToken, validateAdminBFAC, messageController.getAllMessages);
router.post("/", messageController.postMessage);
router.patch("/:messageId", decodeToken, validateAdminBFAC, messageController.markMessageAsRead);
module.exports = router;
