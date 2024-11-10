const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createToken } = require("../utils/authentication");
const { isValidPassword, isValidEmail } = require("../utils/validations");
module.exports.registerUser = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        if (typeof email === "undefined" || typeof password === "undefined") {
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (typeof email !== "string" || !isValidEmail(email)) {
            return res.status(400).send({ error: "Invalid email" });
        }
        if (typeof password !== "string" || !isValidPassword(password)) {
            return res.status(400).send({ error: "Invalid password" });
        }
        if (typeof username !== "undefined" && typeof username !== "string") {
            return res.status(400).send({ error: "Invalid username" });
        }
        let newUser = new User({
            username: username,
            email: email,
            password: bcrypt.hashSync(password, 10),
        });
        let savedUser = await newUser.save();
        res.status(201).send({ success: true, message: "Registered Successfully" });
    } catch (error) {
        next(error);
    }
};
module.exports.loginUser = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        if (typeof email === "undefined" || typeof password === "undefined") {
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (typeof email !== "string" || !isValidEmail(email)) {
            return res.status(400).send({ error: "Invalid email" });
        }
        if (typeof password !== "string") {
            return res.status(400).send({ error: "Invalid password" });
        }
        let foundUsers = await User.find({ email: email });
        if (foundUsers.length < 1) {
            return res.status(401).send({ error: "Access denied. Please provide valid credentials." });
        }
        const foundUser = foundUsers[0];
        const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ error: "Access denied. Please provide valid credentials." });
        }
        const token = createToken({
            _id: foundUser._id,
            username: foundUser.username,
            email: foundUser.email,
            isAdmin: foundUser.isAdmin,
            imageLink: foundUser.imageLink,
        });
        return res.status(200).send({ success: true, message: "User access granted.", access: token });
    } catch (error) {
        next(error);
    }
};
module.exports.retrieveUserDetails = async (req, res, next) => {
    try {
        let { _id } = req.user;
        const foundUser = await User.findById(_id);
        if (!foundUser) {
            return res.status(404).send({ error: "User data not found." });
        }
        foundUser.password = "";
        return res.status(200).send({ success: true, message: "User data found.", user: foundUser });
    } catch (error) {
        next(error);
    }
};
module.exports.updateUser = async (req, res, next) => {
    try {
        let { _id } = req.user;
        let foundUser = await User.findById(_id);
        if (!foundUser) {
            return res.status(400).send({ error: "User not found." });
        }
        let { username, email, password } = req.body;
        if (typeof email !== "undefined" && (typeof email !== "string" || !isValidEmail(email))) {
            return res.status(400).send({ error: "Invalid email" });
        }
        if (typeof password !== "undefined" && (typeof password !== "string" || !isValidPassword(password))) {
            return res.status(400).send({ error: "Invalid password" });
        }
        if (typeof username !== "undefined" && typeof username !== "string") {
            return res.status(400).send({ error: "Invalid username" });
        }
        let hashedPassword;
        if (typeof password !== "undefined") {
            hashedPassword = bcrypt.hashSync(password, 10);
            foundUser.password = hashedPassword || foundUser.password;
        }
        foundUser.email = email || foundUser.email;
        foundUser.username = username || foundUser.username;
        foundUser.password = hashedPassword || foundUser.password;
        let updatedUser = await foundUser.save();
        updatedUser.password = "";
        res.status(200).send({ success: true, message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        next(error);
    }
};
