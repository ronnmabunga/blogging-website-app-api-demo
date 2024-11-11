const logger = require("./logger");
/*
    Request object is expected to have a field `user` that has is an object that contains the authenticated user information.
    If the field `user` is not found in the request object, the module assumes that the user is not authenticated.

    The middlewares under Boolean Flag Access Control expects a Boolean field `isAdmin` that indicates whether an authenticated user has administrative access when true.

    The middlewares under Roles Based Access Control uses the factory pattern. These functions accept an array of strings as argument which will be used to determine whether an authenticated has access. These middelwares expects the `user` object within the request object to have a field `roles` which is an array of strings corresponding to the roles granted to the user.
*/

const validateNotLoggedIn = (req, res, next) => {
    try {
        if (req.user) {
            logger.info("Already logged in. User Authorization Failed.");
            return res.status(403).send({ success: false, message: "You do not have permission to access this resource." });
        }
        next();
    } catch (error) {
        next(error);
    }
};
const validateLoggedIn = (req, res, next) => {
    try {
        if (!req.user) {
            logger.info("User not logged in. User Authorization Failed.");
            return res.status(403).send({ success: false, message: "You do not have permission to access this resource." });
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Boolean Flag Access Control
const validateAdminBFAC = (req, res, next) => {
    try {
        if (!req.user) {
            logger.info("Authentication Failed.");
            return res.status(401).send({ success: false, message: "Authentication Failed. Please provide valid credentials." });
        }
        if (!req.user.isAdmin) {
            logger.info("Admin access required.");
            return res.status(403).send({ success: false, message: "You do not have permission to access this resource." });
        }
        next();
    } catch (error) {
        next(error);
    }
};
const validateNotAdminBFAC = (req, res, next) => {
    try {
        if (!req.user) {
            logger.info("Authentication Failed.");
            return res.status(401).send({ success: false, message: "Authentication Failed. Please provide valid credentials." });
        }
        if (req.user.isAdmin) {
            logger.info("Admins cannot perform this action.");
            return res.status(403).send({ success: false, message: "You do not have permission to access this resource." });
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Roles Based Access Control
const validateRoleRBAC = (allowedRoles) => {
    return function (req, res, next) {
        try {
            if (!req.user) {
                logger.info("Authentication Failed.");
                return res.status(401).send({ success: false, message: "Authentication Failed. Please provide valid credentials." });
            }
            if (!allowedRoles.some((allowedRole) => req.user.roles.includes(allowedRole))) {
                logger.info("User does not have the required role to perform this action.");
                return res.status(403).send({ success: false, message: "You do not have permission to access this resource." });
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
const validateAdminRBAC = (adminRoles) => {
    return function (req, res, next) {
        try {
            if (!req.user) {
                logger.info("Authentication Failed.");
                return res.status(401).send({ success: false, message: "Authentication Failed. Please provide valid credentials." });
            }
            if (!adminRoles.some((adminRole) => req.user.roles.includes(adminRole))) {
                logger.info("Admin access required.");
                return res.status(403).send({ success: false, message: "You do not have permission to access this resource." });
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
const validateNotAdminRBAC = (adminRoles) => {
    return function (req, res, next) {
        try {
            if (!req.user) {
                logger.info("Authentication Failed.");
                return res.status(401).send({ success: false, message: "Authentication Failed. Please provide valid credentials." });
            }
            if (adminRoles.some((adminRole) => req.user.roles.includes(adminRole))) {
                logger.info("Admins cannot perform this action.");
                return res.status(403).send({ success: false, message: "You do not have permission to access this resource." });
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    validateNotLoggedIn,
    validateLoggedIn,
    validateAdminBFAC,
    validateNotAdminBFAC,
    validateRoleRBAC,
    validateAdminRBAC,
    validateNotAdminRBAC,
};
