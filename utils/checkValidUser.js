const User = require("../models/User");
const checkValidUser = async (decodedToken, next) => {
    try {
        let { _id } = decodedToken;
        const foundUser = await User.findById(_id);
        return foundUser;
    } catch (error) {
        next(error);
    }
};
module.exports = checkValidUser;
