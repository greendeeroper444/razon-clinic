require('dotenv').config();

module.exports = {
    //server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    //database configuration
    mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/razon_db',
    
    //JWT configuration
    jwtSecret: process.env.JWT_SECRET || 'razon-secret_key',
    jwtExpiration: process.env.JWT_EXPIRATION || '1d',
    
    //CORS options
    corsOptions: {
        origin: 'http://localhost:5173',
        credentials: true, 
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        // origin: 'http://localhost:5173',
        // credentials: true,
        // methods: ['GET', 'POST', 'PUT', 'DELETE'],
        // allowedHeaders: ['Content-Type', 'Authorization']
    }
};