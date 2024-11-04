const { isValidObjectId } = require("mongoose");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.isValidUser = async (user) => {
    let { _id } = user;
    if (!isValidObjectId(_id)) {
        return false;
    }
    const foundUser = await User.findById(_id);
    return foundUser;
};

module.exports.createToken = async (user) => {
    return jwt.sign(user.toObject(), process.env.JWT_SECRET_KEY);
};

module.exports.verifyToken = async (req, res, next) => {
    let log = { name: "verifyToken", variables: {} };
    req.log.middlewares.push(log);
    let token = req.headers.authorization;
    log.variables["token"] = token;
    if (typeof token !== "string" || token.length < 8) {
        log.variables["message"] = "401 No Token Found. Authentication Failed.";
        req.log = { ...req.log, statusCode: 401, level: "error" };
        return res.status(401).send({ error: "Access denied. Please provide valid credentials." });
    }
    token = token.slice(7, token.length);
    log.variables["token"] = token;
    jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, decodedToken) {
        log.variables["err"] = err;
        log.variables["decodedToken"] = decodedToken;
        if (err) {
            log.variables["message"] = "401 Token Verification Failed. Authentication Failed.";
            req.log = { ...req.log, statusCode: 401, level: "error" };
            return res.status(401).send({ error: "Access denied. Please provide valid credentials." });
        } else {
            let isValidUser = await exports.isValidUser(decodedToken);
            log.variables["isValidUser"] = isValidUser;
            if (isValidUser) {
                log.variables["message"] = "Token Verification Successful. User Verification Successful.";
                req.user = decodedToken;
                next();
            } else {
                log.variables["message"] = "403 Token Verification Successful. User Verification Failed.";
                req.log = { ...req.log, statusCode: 403, level: "error" };
                return res.status(403).send({ error: "You do not have permission to access this resource." });
            }
        }
    });
};

module.exports.decodeTokenIfItExists = async (req, res, next) => {
    let log = { name: "decodeTokenIfItExists", variables: {} };
    req.log.middlewares.push(log);
    let token = req.headers.authorization;
    log.variables["token"] = token;
    if (typeof token !== "string" || token.length < 8) {
        log.variables["message"] = "No Token Found. Authentication Failed.";
        next();
    }
    token = token.slice(7, token.length);
    log.variables["token"] = token;
    jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, decodedToken) {
        log.variables["err"] = err;
        log.variables["decodedToken"] = decodedToken;
        if (err) {
            log.variables["message"] = "Token Verification Failed. Authentication Failed.";
            next();
        } else {
            let isValidUser = await exports.isValidUser(decodedToken);
            log.variables["isValidUser"] = isValidUser;
            if (isValidUser) {
                log.variables["message"] = "Token Verification Successful. User Verification Successful.";
                req.user = decodedToken;
                next();
            } else {
                log.variables["message"] = "Token Verification Successful. User Verification Failed.";
                next();
            }
        }
    });
};

module.exports.verifyAdminToken = async (req, res, next) => {
    let log = { name: "verifyAdminToken", variables: {} };
    req.log.middlewares.push(log);
    let isAdmin = req.user.isAdmin;
    log.variables["isAdmin"] = isAdmin;
    if (isAdmin) {
        log.variables["message"] = "Token Verification Successful. Admin Access Granted.";
        next();
    } else {
        log.variables["message"] = "Token Verification Successful. Admin Verification Failed.";
        req.log = { ...req.log, statusCode: 403, level: "error" };
        return res.status(403).send({ error: "You do not have permission to access this resource." });
    }
};

module.exports.verifyNoToken = async (req, res, next) => {
    let log = { name: "verifyNoToken", variables: {} };
    req.log.middlewares.push(log);
    let token = req.headers.authorization;
    log.variables["token"] = token;
    if (typeof token === "string" && token.length > 7) {
        token = token.slice(7, token.length);
        log.variables["token"] = token;
        jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, decodedToken) {
            log.variables["err"] = err;
            log.variables["decodedToken"] = decodedToken;
            if (err) {
                log.variables["message"] = "Token Verification Failed. Access Granted.";
                next();
            } else {
                let isValidUser = await exports.isValidUser(decodedToken);
                log.variables["isValidUser"] = isValidUser;
                if (isValidUser) {
                    log.variables["message"] = "403 Token Verification Successful. Access Denied.";
                    req.log = { ...req.log, statusCode: 403, level: "error" };
                    return res.status(403).send({ error: "You do not have permission to access this resource." });
                } else {
                    log.variables["message"] = "Token Verification Successful. User Verification Failed. Access Granted.";
                    next();
                }
            }
        });
    } else {
        log.variables["message"] = "No Token Found. User Verification Failed. Access Granted.";
        next();
    }
};

module.exports.errorHandler = async (error, req, res, next) => {
    let log = { name: "errorHandler", variables: {} };
    req.log.middlewares.push(log);
    const statusCode = error.status || 500;
    const errorMessage = error.message || "An unexpected error has occurred.";
    log.variables["error"] = error;
    req.log = { ...req.log, statusCode: statusCode, level: "error" };
    res.status(statusCode).send({ error: errorMessage });
};
