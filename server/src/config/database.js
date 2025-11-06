const mongoose = require('mongoose');
const config = require('./index');
const logger = require('@utils/logger')

const connectDB = async () => {
    try {
        // set mongoose options
        // const options = {
        //   useNewUrlParser: true,
        //   useUnifiedTopology: true
        // };
        
        //connect to MongoDB
        const conn = await mongoose.connect(config.mongoUri);
        
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`Error connecting to database: ${error.message}`);
        throw error;
    }
};

module.exports = { connectDB };