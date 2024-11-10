const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const messageRoutes = require("./routes/message");
require("dotenv").config();
const PORT = process.env.DEMO1_PORT;
const MONGO_STRING = process.env.DEMO1_MONGO_STRING;
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = { origin: ["https://wanderwords-blog-app-portfolio.vercel.app", "https://wanderwords-blog-app-portfolio-ronnmabungas-projects.vercel.app", "https://wanderwords-blog-app-portfolio-git-main-ronnmabungas-projects.vercel.app"], credentials: true };
app.use(cors(corsOptions));

app.use((req, res, next) => {
    req.log = { middlewares: [], request: { method: req.method, url: req.url, body: req.body, query: req.query, headers: req.headers } };
    next();
});
app.use((req, res, next) => {
    const originalSend = res.send;
    let responseLogged = false;
    res.send = function (body) {
        if (!responseLogged) {
            console.log("===================================\n" + JSON.stringify(req.log, null, 2));
            responseLogged = true;
        }
        return originalSend.call(this, body);
    };
    next();
});
app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/messages", messageRoutes);

mongoose.connect(MONGO_STRING);
mongoose.connection.once("open", () => console.log("Connected to database."));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`API is now online on port ${PORT}`);
    });
}

module.exports = app;
