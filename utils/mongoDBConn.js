const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        mongoose.connection.once("open", () => logger.info("Blog API: connected to MongoDB"));
    } catch (err) {
        logger.error(err.message);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.connection.close();
    logger.info("Blog API: Disconnected from MongoDB");
};

module.exports = { connectDB, disconnectDB };
