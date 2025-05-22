const jwt = require('jsonwebtoken');
const config = require('../../config');
const { ApiError } = require('../../utils/errors');

const authenticate = (req, res, next) => {
    try {
        //get token from authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError('Authentication required', 401);
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            throw new ApiError('Authentication required', 401);
        }
        
        //verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        
        //attach user to request object
        req.user = decoded;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new ApiError('Invalid token', 401));
        } else if (error.name === 'TokenExpiredError') {
            next(new ApiError('Token expired', 401));
        } else {
            next(error);
        }
    }
};

module.exports = { authenticate };