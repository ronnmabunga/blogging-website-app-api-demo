const logger = require("./logger");
const mongoose = require("mongoose");

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        logger.info("Connected to MongoDB");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.connection.close();
    logger.info("Disconnected from MongoDB");
};

module.exports = { connectDB, disconnectDB };
