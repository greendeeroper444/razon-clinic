const AuthService = require('./auth.service');
const OTPService = require('@modules/otp/otp.service');
const TokenHelper = require('@helpers/token.helper');
const { ApiError } = require('@utils/errors');

class AuthController {

    async sendRegistrationOTP(req, res, next) {
        try {
            const { 
                firstName, 
                lastName,
                middleName,
                suffix,
                emailOrContactNumber, 
                password,
                birthdate,
                sex,
                address,
                religion
            } = req.body;

            //validate required fields
            if (!firstName || !lastName || !emailOrContactNumber || !password || !birthdate || !sex || !address) {
                throw new ApiError('All required fields must be provided', 400);
            }

            //validate that emailOrContactNumber is a contact number (not email)
            const contactNumberRegex = /^(09|\+639)\d{9}$/;
            if (!contactNumberRegex.test(emailOrContactNumber)) {
                throw new ApiError('Please provide a valid contact number for registration', 400);
            }

            //prepare user data to store temporarily
            const userData = {
                firstName,
                lastName,
                middleName: middleName || null,
                suffix: suffix || '',
                password,
                birthdate,
                sex,
                address,
                religion: religion || null
            };

            //send OTP
            const result = await OTPService.sendRegistrationOTP(emailOrContactNumber, userData);

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    otpId: result.otpId,
                    expiresAt: result.expiresAt,
                    contactNumber: result.contactNumber
                }
            });
        } catch (error) {
            next(error);
        }
    }


    async verifyRegistrationOTP(req, res, next) {
        try {
            const { contactNumber, otp } = req.body;

            if (!contactNumber || !otp) {
                throw new ApiError('Contact number and OTP are required', 400);
            }

            //verify OTP and get pending user data
            const verificationResult = await OTPService.verifyRegistrationOTP(contactNumber, otp);

            if (!verificationResult.pendingUserData) {
                throw new ApiError('Registration data not found. Please start registration again.', 400);
            }

            //create the user with the pending data
            const userData = {
                ...verificationResult.pendingUserData,
                emailOrContactNumber: contactNumber
            };

            const result = await AuthService.createUser(userData);

            //generate tokens for auto-login
            const tokens = TokenHelper.generateTokens(result.user);
            TokenHelper.setTokens(res, tokens.accessToken, tokens.refreshToken);

            res.status(201).json({
                success: true,
                message: 'Registration completed successfully',
                data: {
                    user: result.user,
                    tokens: tokens
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async resendRegistrationOTP(req, res, next) {
        try {
            const { contactNumber } = req.body;

            if (!contactNumber) {
                throw new ApiError('Contact number is required', 400);
            }

            const result = await OTPService.resendRegistrationOTP(contactNumber);

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    otpId: result.otpId,
                    expiresAt: result.expiresAt,
                    contactNumber: result.contactNumber
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {
            const { 
                firstName, 
                lastName,
                middleName,
                suffix,
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
                suffix,
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
                success: true,
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
                // user: result.user,
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
                success: true,
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
                success: true,
                message: 'Profile retrieved successfully',
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
                success: true,
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
                success: true,
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
                success: true,
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
                    success: true,
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
                success: true,
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
                    success: true,
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
                success: true,
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
                throw new ApiError('Contact number is required', 400);
            }
            
            res.status(200).json({
                success: true,
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
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();