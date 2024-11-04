const express = require("express");
const userController = require("../controllers/user");
const { verifyNoToken, verifyToken } = require("../utils");
const router = express.Router();
router.post("/register", verifyNoToken, userController.registerUser);
router.post("/login", verifyNoToken, userController.loginUser);
router.get("/details", verifyToken, userController.retrieveUserDetails);
router.patch("/", verifyToken, userController.updateUser);
module.exports = router;
