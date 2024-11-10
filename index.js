const express = require("express");
const { connectDB } = require("./utils/mongoDBConn");
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const messageRoutes = require("./routes/message");
require("dotenv").config();
const PORT = process.env.DEMO1_PORT;
const MONGO_STRING = `${process.env.DEMO1_MONGO_STRING}`;
const morgan = require("morgan");
const logger = require("./utils/logger");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = { origin: ["https://wanderwords-blog-app-portfolio.vercel.app"], credentials: true };
app.use(cors(corsOptions));

app.use(morgan("combined", { stream: logger.stream }));

app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/messages", messageRoutes);

app.use((err, req, res, next) => {
    logger.error(`Error encountered: ${err.message}`);
    const statusCode = err.status || 500;
    const errorMessage = err.message || "An unexpected error has occurred.";
    res.status(statusCode).send({ error: errorMessage });
});

if (require.main === module) {
    connectDB(MONGO_STRING);
    app.listen(PORT, () => {
        console.log(`API is now online on port ${PORT}`);
    });
}

module.exports = app;
