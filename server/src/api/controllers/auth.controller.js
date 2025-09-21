const AuthService = require('../../services/auth.service');
const TokenHelper = require('../../helpers/token.helpers');
const { ApiError } = require('../../utils/errors');

class AuthController {

    async register(req, res, next) {
        try {
            const { 
                firstName, 
                lastName,
                middleName,
                emailOrContactNumber, 
                password,
                birthdate,
                sex,
                address,
                religion
            } = req.body;
            
            const userData = {
                firstName,
                lastName,
                middleName,
                emailOrContactNumber,
                password,
                birthdate,
                sex,
                address,
                religion
            };
            
            const result = await AuthService.createUser(userData);
            
            const tokens = TokenHelper.generateTokens(result.user);
            
            TokenHelper.setTokens(res, tokens.accessToken, tokens.refreshToken);
            
            res.status(201).json({
                status: 'success',
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    tokens: tokens
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { emailOrContactNumber, password } = req.body;
            
            const result = await AuthService.authenticateUser(emailOrContactNumber, password);
            
            const tokens = TokenHelper.generateTokens(result.user);
            const decoded = TokenHelper.verifyAccessToken(tokens.accessToken);
            
            TokenHelper.setTokens(res, tokens.accessToken, tokens.refreshToken);
            
            const isAdmin = TokenHelper.isAdmin(decoded);
            const isUser = TokenHelper.isUser(decoded);
            
            const responseData = {
                user: result.user,
                tokens: tokens,
                userType: isAdmin ? 'admin' : 'user',
                role: decoded.role
            };
            
            if (isAdmin) {
                responseData.isDoctor = TokenHelper.isDoctor(decoded);
                responseData.isStaff = TokenHelper.isStaff(decoded);
            }
            
            if (isUser) {
                responseData.userNumber = decoded.userNumber;
                responseData.isPatient = TokenHelper.isPatient(decoded);
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: responseData
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userType = req.user.userType;
            
            const result = await AuthService.getUserProfile(userId, userType);
            
            res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const userType = req.user.userType;
            const updateData = req.body;
            
            const result = await AuthService.updateUserProfile(userId, userType, updateData);
            
            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const userType = req.user.userType;
            const { currentPassword, newPassword, confirmPassword } = req.body;
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new ApiError('Current password, new password, and confirm password are required', 400);
            }
            
            if (newPassword !== confirmPassword) {
                throw new ApiError('New password and confirm password do not match', 400);
            }
            
            if (newPassword.length < 6) {
                throw new ApiError('New password must be at least 6 characters long', 400);
            }
            
            if (currentPassword === newPassword) {
                throw new ApiError('New password must be different from current password', 400);
            }
            
            const result = await AuthService.changePassword(userId, userType, currentPassword, newPassword);
            
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req, res, next) {
        try {
            const userId = req.user.id;
            const userType = req.user.userType;
            
            const rawUserData = await AuthService.getRawUserData(userId, userType);
            
            const tokens = TokenHelper.generateTokens(rawUserData);
            
            TokenHelper.setTokens(res, tokens.accessToken, tokens.refreshToken);
            
            const formattedResult = AuthService.formatUserResponse(rawUserData, userType);
            
            res.status(200).json({
                status: 'success',
                message: 'Token refreshed successfully',
                data: {
                    tokens: tokens,
                    user: formattedResult.user
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyToken(req, res, next) {
        try {
            const token = TokenHelper.extractToken(req, 'access');
            
            if (!token) {
                return res.status(200).json({
                    status: 'success',
                    message: 'No token found',
                    data: {
                        isValid: false,
                        error: 'No access token found in cookies'
                    }
                });
            }
            
            const decoded = TokenHelper.verifyAccessToken(token);
            const user = TokenHelper.createUserFromToken(decoded);
            
            const isExpired = TokenHelper.isTokenExpired(token);
            const expiration = TokenHelper.getTokenExpiration(token);
            
            res.status(200).json({
                status: 'success',
                message: 'Token is valid',
                data: {
                    decoded: user,
                    isValid: !isExpired,
                    isExpired: isExpired,
                    expiration: expiration,
                    userType: user.modelType,
                    role: user.role
                }
            });
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(200).json({
                    status: 'success',
                    message: 'Token verification result',
                    data: {
                        isValid: false,
                        isExpired: error.name === 'TokenExpiredError',
                        error: error.message
                    }
                });
            }
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            TokenHelper.clearAuthCookies(res);
            
            res.status(200).json({
                status: 'success',
                message: 'Successfully logged out'
            });
        } catch (error) {
            next(error);
        }
    }

    async requestPasswordReset(req, res, next) {
        try {
            const { emailOrContactNumber } = req.body;
            
            if (!emailOrContactNumber) {
                throw new ApiError('Email or contact number is required', 400);
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Password reset instructions sent successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { resetToken, newPassword, confirmPassword } = req.body;
            
            if (!resetToken || !newPassword || !confirmPassword) {
                throw new ApiError('Reset token, new password, and confirm password are required', 400);
            }
            
            if (newPassword !== confirmPassword) {
                throw new ApiError('New password and confirm password do not match', 400);
            }
            
            if (newPassword.length < 6) {
                throw new ApiError('New password must be at least 6 characters long', 400);
            }
            
            res.status(200).json({
                status: 'success',
                message: 'Password reset successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();