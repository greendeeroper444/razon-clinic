require('dotenv').config();
require('module-alias/register');

const express = require('express');

const config = require('@config');
const logger = require('@utils/logger');
const { connectDB } = require('@config/database');
const setupMiddleware = require('@middlewares/middleware');
const setupRoutes = require('@routes');
const errorHandler = require('@middlewares/errorHandler.middleware');
const { startArchiveJob } = require('@jobs/archiveInActivePatients.job');


//initialize express app
const app = express();

//setup all middleware
setupMiddleware(app);

//setup all routes
setupRoutes(app);

//error handling middleware (must be last)
app.use(errorHandler);

//start server function
const startServer = async () => {
    try {
        //connect to database
        await connectDB();
        
        //start cron jobs
        startArchiveJob();

        //start server
        const PORT = config.port || 3000;
            app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server', err);
        process.exit(1);
    }
};

//handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection', err);
    //don't exit process in production, just log it
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
});

//handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  //cracefully shutdown in case of uncaught exception
  process.exit(1);
});

//start the server
startServer();

module.exports = app;