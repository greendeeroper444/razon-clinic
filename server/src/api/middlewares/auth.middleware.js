const TokenHelper = require('../../helpers/token.helpers');
const { ApiError } = require('../../utils/errors');

const authenticate = (req, res, next) => {
    try {
        const token = TokenHelper.extractToken(req, 'access');
        
        if (!token) {
            throw new ApiError('Authentication required - Please login', 401);
        }
        
        const decoded = TokenHelper.verifyAccessToken(token);
        
        const user = TokenHelper.createUserFromToken(decoded);
        
        //attach user to request object with additional properties
        req.user = {
            ...user,
            id: user.userId,
            userType: user.modelType, // 'admin' or 'user'
            isAdmin: TokenHelper.isAdmin(decoded),
            isUser: TokenHelper.isUser(decoded),
            isDoctor: TokenHelper.isDoctor(decoded),
            isStaff: TokenHelper.isStaff(decoded),
            isPatient: TokenHelper.isPatient(decoded)
        };
        
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


const authenticateRefresh = (req, res, next) => {
    try {

        const refreshToken = TokenHelper.extractToken(req, 'refresh');
        
        if (!refreshToken) {
            throw new ApiError('Refresh token required - Please login again', 401);
        }
        
        const decoded = TokenHelper.verifyRefreshToken(refreshToken);
        
        const user = TokenHelper.createUserFromToken(decoded);
        
        req.user = {
            ...user,
            id: user.userId,
            userType: user.modelType,
            isAdmin: TokenHelper.isAdmin(decoded),
            isUser: TokenHelper.isUser(decoded)
        };
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new ApiError('Invalid refresh token', 401));
        } else if (error.name === 'TokenExpiredError') {
            next(new ApiError('Refresh token expired', 401));
        } else {
            next(error);
        }
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return next(new ApiError('Admin access required', 403));
    }
    next();
};


const requireDoctor = (req, res, next) => {
    if (!req.user || !req.user.isDoctor) {
        return next(new ApiError('Doctor access required', 403));
    }
    next();
};


const requireStaff = (req, res, next) => {
    if (!req.user || (!req.user.isDoctor && !req.user.isStaff)) {
        return next(new ApiError('Staff access required', 403));
    }
    next();
};

const requirePatient = (req, res, next) => {
    if (!req.user || !req.user.isPatient) {
        return next(new ApiError('Patient access required', 403));
    }
    next();
};


const requireUser = (req, res, next) => {
    if (!req.user || !req.user.isUser) {
        return next(new ApiError('User access required', 403));
    }
    next();
};

module.exports = { 
    authenticate,
    authenticateRefresh,
    requireAdmin,
    requireDoctor,
    requireStaff,
    requirePatient,
    requireUser
};