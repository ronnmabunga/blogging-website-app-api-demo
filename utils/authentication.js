require("dotenv").config();
const jwt = require("jsonwebtoken");
const checkValidUser = require("./checkValidUser");
const JWT_SECRET_KEY = process.env.DEMO1_JWT_SECRET_KEY;

const createToken = (payloadObj) => {
    return jwt.sign(payloadObj, JWT_SECRET_KEY);
};
const decodeToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (typeof token !== "string" || token.length < 8) {
            console.log("No Token Found. Authentication Failed.");
            next();
            return;
        }
        token = token.slice(7, token.length);
        jwt.verify(token, JWT_SECRET_KEY, async function (err, decodedToken) {
            if (err) {
                console.log("Token Verification Failed. Authentication Failed.");
                next();
            } else {
                let isValidUser = await checkValidUser(decodedToken, next);
                if (isValidUser) {
                    console.log("Token Verification Successful. User Verification Successful.");
                    req.user = decodedToken;
                    next();
                } else {
                    console.log("Token Verification Successful. User Verification Failed.");
                    next();
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createToken, decodeToken };
