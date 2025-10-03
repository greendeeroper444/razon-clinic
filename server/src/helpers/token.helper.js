const jwt = require('jsonwebtoken');

class TokenHelper {
    constructor() {
        this.ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'default-secret';
        this.REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
        this.ACCESS_TOKEN_EXPIRES = process.env.JWT_EXPIRATION || '15m';
        this.REFRESH_TOKEN_EXPIRES = process.env.JWT_REFRESH_EXPIRATION || '7d'
    }

    //helper method to determine if the data is from Admin or User model
    _isAdminModel(userData) {
        const data = userData.toJSON ? userData.toJSON() : userData;
        
        if (data.role && ['Doctor', 'Staff'].includes(data.role)) {
            return true;
        }
        
        if (data.userNumber !== undefined) {
            return false;
        }
        
        if (data.role === 'Patient') {
            return false;
        }
        
        return data.role === 'Doctor' || data.role === 'Staff';
    }

    //helper method to determine if the data is from User model
    _isUserModel(userData) {
        const data = userData.toJSON ? userData.toJSON() : userData;
        
        if (data.userNumber !== undefined) {
            return true;
        }
        
        if (data.role === 'Patient') {
            return true;
        }
        
        if (data.role && ['Doctor', 'Staff'].includes(data.role)) {
            return false;
        }
        
        return data.role === 'Patient' || data.role === 'User';
    }

    //normalize data based on model type
    _normalizeUserData(userData) {
        const data = userData.toJSON ? userData.toJSON() : userData;
        
        
        if (this._isAdminModel(userData)) {
            //admin model data structure
            return {
                userId: data.id || data._id,
                email: data.email,
                contactNumber: data.contactNumber,
                name: `${data.firstName} ${data.lastName}`,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                modelType: 'admin'
            };
        } else if (this._isUserModel(userData)) {
            //user model data structure
            return {
                userId: data.id || data._id,
                email: data.email,
                contactNumber: data.contactNumber,
                name: `${data.firstName} ${data.lastName}`,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || 'Patient',
                userNumber: data.userNumber,
                modelType: 'user'
            };
        } else {
            
            //if it has userNumber or role is Patient, treat as User
            if (data.userNumber !== undefined || data.role === 'Patient' || data.role === 'User') {
                return {
                    userId: data.id || data._id,
                    email: data.email,
                    contactNumber: data.contactNumber,
                    name: `${data.firstName} ${data.lastName}`,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: data.role || 'Patient',
                    userNumber: data.userNumber,
                    modelType: 'user'
                };
            }
            
            //otherwise treat as Admin
            return {
                userId: data.id || data._id,
                email: data.email,
                contactNumber: data.contactNumber,
                name: `${data.firstName} ${data.lastName}`,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role || 'Doctor',
                modelType: 'admin'
            };
        }
    }

    //generate access token with model-specific payload
    generateAccessToken(userData) {
        const normalizedData = this._normalizeUserData(userData);
        
        let payload = {
            userId: normalizedData.userId,
            email: normalizedData.email,
            contactNumber: normalizedData.contactNumber,
            name: normalizedData.name,
            firstName: normalizedData.firstName,
            lastName: normalizedData.lastName,
            role: normalizedData.role,
            modelType: normalizedData.modelType
        };

        if (normalizedData.modelType === 'user') {
            payload.userNumber = normalizedData.userNumber;
        }

        return jwt.sign(
            payload,
            this.ACCESS_TOKEN_SECRET,
            { expiresIn: this.ACCESS_TOKEN_EXPIRES }
        );
    }

    //generate refresh token with model-specific payload
    generateRefreshToken(userData) {
        const normalizedData = this._normalizeUserData(userData);
        
        let payload = {
            userId: normalizedData.userId,
            email: normalizedData.email,
            contactNumber: normalizedData.contactNumber,
            role: normalizedData.role,
            modelType: normalizedData.modelType,
            tokenType: 'refresh'
        };
        
        if (normalizedData.modelType === 'user') {
            payload.userNumber = normalizedData.userNumber;
        }

        return jwt.sign(
            payload,
            this.REFRESH_TOKEN_SECRET,
            { expiresIn: this.REFRESH_TOKEN_EXPIRES }
        );
    }

    //generate both tokens
    generateTokens(userData) {
        return {
            accessToken: this.generateAccessToken(userData),
            refreshToken: this.generateRefreshToken(userData)
        };
    }

    //verify access token
    verifyAccessToken(token) {
        return jwt.verify(token, this.ACCESS_TOKEN_SECRET);
    }

    //verify refresh token
    verifyRefreshToken(token) {
        return jwt.verify(token, this.REFRESH_TOKEN_SECRET);
    }

    //extract token from cookies
    extractToken(req, tokenType = 'access') {
        if (tokenType === 'access') {
            return req.cookies.accessToken || req.cookies.token;
        } else if (tokenType === 'refresh') {
            return req.cookies.refreshToken;
        }
        return null;
    }

    //set tokens as HTTP-only cookies
    setTokens(res, accessToken, refreshToken) {
        this.setAccessTokenCookie(res, accessToken);
        this.setRefreshTokenCookie(res, refreshToken);
    }

    //set access token cookie
    setAccessTokenCookie(res, accessToken) {
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 15 * 60 * 1000 //15 minutes
        });
    }

    //set refresh token cookie
    setRefreshTokenCookie(res, refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
        });
    }

    //clear all auth cookies
    clearAuthCookies(res) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        };

        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        res.clearCookie('token', cookieOptions);
    }

    //decode token without verification (for debugging)
    decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    //check if token is expired
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return true;
            
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    //get token expiration time
    getTokenExpiration(token) {
        try {
            const decoded = this.decodeToken(token);
            return decoded ? decoded.exp : null;
        } catch (error) {
            return null;
        }
    }

    //create user object from token payload with model-specific handling
    createUserFromToken(decoded) {
        const baseUserObj = {
            userId: decoded.userId,
            email: decoded.email,
            contactNumber: decoded.contactNumber,
            name: decoded.name,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            role: decoded.role,
            modelType: decoded.modelType
        };

        if (decoded.modelType === 'user') {
            baseUserObj.userNumber = decoded.userNumber;
        }

        return baseUserObj;
    }

    //check if token belongs to admin (Doctor or Staff)
    isAdmin(decoded) {
        return decoded.modelType === 'admin' && (decoded.role === 'Doctor' || decoded.role === 'Staff');
    }

    //check if token belongs to user/patient
    isUser(decoded) {
        return decoded.modelType === 'user' && (decoded.role === 'Patient' || decoded.role === 'User');
    }

    //check if token belongs to Doctor specifically
    isDoctor(decoded) {
        return decoded.modelType === 'admin' && decoded.role === 'Doctor';
    }

    //check if token belongs to Staff specifically
    isStaff(decoded) {
        return decoded.modelType === 'admin' && decoded.role === 'Staff';
    }

    //check if token belongs to Patient specifically
    isPatient(decoded) {
        return decoded.modelType === 'user' && (decoded.role === 'Patient' || decoded.role === 'User');
    }

    //get user type from token
    getUserType(decoded) {
        if (this.isDoctor(decoded)) return 'doctor';
        if (this.isStaff(decoded)) return 'staff';
        if (this.isPatient(decoded)) return 'patient';
        return 'unknown';
    }
}

module.exports = new TokenHelper();