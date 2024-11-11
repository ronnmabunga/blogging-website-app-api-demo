const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async (uri) => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(uri);
            mongoose.connection.once("open", () => {
                logger.info("Blog API: Connected to MongoDB");
            });
        } else if (mongoose.connection.readyState === 2) {
            await new Promise((resolve) => {
                mongoose.connection.once("open", resolve);
            });
            logger.info("Blog API: Connection is now open after waiting.");
        } else {
            logger.info("Blog API: Connection is already open.");
        }
    } catch (err) {
        logger.error(err.message);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.connection.close();
    mongoose.connection.on("disconnected", () => {
        logger.info("Blog API: Disconnected from MongoDB");
    });
};

module.exports = { connectDB, disconnectDB };
