const { createLogger, format, transports } = require("winston");

const consoleTransport = new transports.Console();
const fileTransport = new transports.File({ filename: "combined.log" });

const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp(), format.json()),
    transports: [consoleTransport, fileTransport],
});

function turnOffConsoleLogging() {
    logger.remove(consoleTransport);
}

function turnOnConsoleLogging() {
    if (!logger.transports.includes(consoleTransport)) {
        logger.add(consoleTransport);
    }
}

module.exports = logger;
module.exports.stream = {
    write: (message) => logger.info(message.trim()),
};
module.exports.turnOffConsoleLogging = turnOffConsoleLogging;
module.exports.turnOnConsoleLogging = turnOnConsoleLogging;
