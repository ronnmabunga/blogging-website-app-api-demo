const bcrypt = require("bcrypt");
const User = require("../models/User");
const { errorHandler, createToken } = require("../utils");
const { isValidPassword, isValidEmail } = require("../utils/validations");
module.exports.registerUser = async (req, res) => {
    let log = { name: "registerUser", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { username, email, password } = req.body;
        if (typeof email === "undefined" || typeof password === "undefined") {
            log.variables["message"] = "400 Required inputs missing";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (typeof email !== "string" || !isValidEmail(email)) {
            log.variables["message"] = "400 Invalid email";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid email" });
        }
        if (typeof password !== "string" || !isValidPassword(password)) {
            log.variables["message"] = "400 Invalid password";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid password" });
        }
        if (typeof username !== "undefined" && typeof username !== "string") {
            log.variables["message"] = "400 Invalid username";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid username" });
        }
        let newUser = new User({
            username: username,
            email: email,
            password: bcrypt.hashSync(password, 10),
        });
        let savedUser = await newUser.save();
        log.variables["savedUser"] = savedUser;
        log.variables["message"] = "201 User registered.";
        req.log = { ...req.log, statusCode: 201, level: "success" };
        res.status(201).send({ success: true, message: "Registered Successfully" });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.loginUser = async (req, res) => {
    let log = { name: "loginUser", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { email, password } = req.body;
        if (typeof email === "undefined" || typeof password === "undefined") {
            log.variables["message"] = "400 Required inputs missing";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (typeof email !== "string" || !isValidEmail(email)) {
            log.variables["message"] = "400 Invalid email";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid email" });
        }
        if (typeof password !== "string") {
            log.variables["message"] = "400 Invalid password";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid password" });
        }
        let foundUsers = await User.find({ email: email });
        log.variables["foundUsers"] = foundUsers;
        if (foundUsers.length < 1) {
            log.variables["message"] = "401 User not found.";
            req.log = { ...req.log, statusCode: 401, level: "error" };
            return res.status(401).send({ error: "Access denied. Please provide valid credentials." });
        }
        const foundUser = foundUsers[0];
        const isPasswordCorrect = bcrypt.compareSync(password, foundUser.password);
        log.variables["isPasswordCorrect"] = isPasswordCorrect;
        if (!isPasswordCorrect) {
            log.variables["message"] = "401 Incorrect password.";
            req.log = { ...req.log, statusCode: 401, level: "error" };
            return res.status(401).send({ error: "Access denied. Please provide valid credentials." });
        }
        const token = await createToken(foundUser);
        log.variables["token"] = token;
        log.variables["message"] = "200 User access granted.";
        req.log = { ...req.log, statusCode: 200, level: "success" };
        return res.status(200).send({ success: true, message: "User access granted.", access: token });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.retrieveUserDetails = async (req, res) => {
    let log = { name: "retrieveUserDetails", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { _id } = req.user;
        const foundUser = await User.findById(_id);
        log.variables["foundUser"] = foundUser;
        if (!foundUser) {
            log.variables["message"] = "404 User data not found.";
            req.log = { ...req.log, statusCode: 404, level: "error" };
            return res.status(404).send({ error: "User data not found." });
        }
        foundUser.password = "";
        log.variables["message"] = "200 User data found.";
        req.log = { ...req.log, statusCode: 200, level: "success" };
        return res.status(200).send({ success: true, message: "User data found.", user: foundUser });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.updateUser = async (req, res) => {
    let log = { name: "updateUser", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { _id } = req.user;
        let foundUser = await User.findById(_id);
        log.variables["foundUser"] = foundUser;
        if (!foundUser) {
            log.variables["message"] = "400 User not found.";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "User not found." });
        }
        let { username, email, password } = req.body;
        if (typeof email !== "undefined" && (typeof email !== "string" || !isValidEmail(email))) {
            log.variables["message"] = "400 Invalid email";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid email" });
        }
        if (typeof password !== "undefined" && (typeof password !== "string" || !isValidPassword(password))) {
            log.variables["message"] = "400 Invalid password";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid password" });
        }
        if (typeof username !== "undefined" && typeof username !== "string") {
            log.variables["message"] = "400 Invalid username";
            req.log = { ...req.log, statusCode: 400, level: "error" };
            return res.status(400).send({ error: "Invalid username" });
        }
        if (typeof password !== "undefined") {
            const hashedPassword = bcrypt.hashSync(password, 10);
            foundUser.password = hashedPassword || foundUser.password;
        }
        foundUser.email = email || foundUser.email;
        foundUser.username = username || foundUser.username;
        foundUser.password = hashedPassword || foundUser.password;
        let updatedUser = await foundUser.save();
        log.variables["updatedUser"] = updatedUser;
        updatedUser.password = "";
        log.variables["message"] = "200 User updated.";
        req.log = { ...req.log, statusCode: 200, level: "success" };
        res.status(200).send({ success: true, message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
