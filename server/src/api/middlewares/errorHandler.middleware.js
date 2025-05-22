const logger = require("../../utils/logger");

const errorHandler = (err, req, res, next) => {
    //log error
    logger.error(`Error: ${err.message}`, { 
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    //check if headers already sent
    if (res.headersSent) {
        return next(err);
    }

    //determine status code
    const statusCode = err.statusCode || 500;
    
    //send error response
    res.status(statusCode).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

module.exports = errorHandler;