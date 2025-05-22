const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const config = require('../../config');
const logger = require('../../utils/logger');

const setupMiddleware = (app) => {
    //security middleware
    app.use(helmet());
    app.use(cors(config.corsOptions));
    
    //request parsing middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    //performance middleware
    app.use(compression());
    
    //logging middleware
    app.use(morgan('combined', { stream: logger.stream }));
    
    //health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).send({ status: 'ok', timestamp: new Date() });
    });
  
  // 404 handler - comes after routes are set up, implemented in routes.js
};

module.exports = setupMiddleware;