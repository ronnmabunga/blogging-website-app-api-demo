require("dotenv").config();
const jwt = require("jsonwebtoken");
const logger = require("./logger");
const checkValidUser = require("./checkValidUser");
const JWT_SECRET_KEY = `${process.env.DEMO1_JWT_SECRET_KEY}`;

const createToken = (payloadObj) => {
    return jwt.sign(payloadObj, JWT_SECRET_KEY);
};
const decodeToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (typeof token !== "string" || token.length < 8) {
            logger.info("No Token Found. Authentication Failed.");
            next();
            return;
        }
        token = token.slice(7, token.length);
        jwt.verify(token, JWT_SECRET_KEY, async function (err, decodedToken) {
            if (err) {
                logger.info("Token Verification Failed. Authentication Failed.");
                next();
            } else {
                let isValidUser = await checkValidUser(decodedToken, next);
                if (isValidUser) {
                    logger.info("Token Verification Successful. User Verification Successful.");
                    req.user = decodedToken;
                    next();
                } else {
                    logger.info("Token Verification Successful. User Verification Failed.");
                    next();
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createToken, decodeToken };
