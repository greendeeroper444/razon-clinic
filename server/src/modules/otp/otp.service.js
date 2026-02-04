const OTP = require('./otp.model');
const User = require('@modules/user/user.model');
const sendSMS = require('@utils/smsSender');
const { ApiError } = require('@utils/errors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class OTPService {
    
    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    
    async sendRegistrationOTP(contactNumber, userData) {
        try {
            //check if contact number already exists
            const existingUser = await User.findOne({ contactNumber: contactNumber });
            if (existingUser) {
                throw new ApiError('Contact number already registered', 400);
            }

            //invalidate any previous registration OTPs for this contact number
            await OTP.updateMany(
                { 
                    contactNumber: contactNumber,
                    purpose: 'registration',
                    isUsed: false 
                },
                { 
                    isUsed: true,
                    usedAt: new Date()
                }
            );

            const otpCode = this.generateOTP();

            // create OTP record without userId (since user doesn't exist yet)
            const otp = await OTP.create({
                userId: null, // No user yet
                otp: otpCode,
                purpose: 'registration',
                contactNumber: contactNumber,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), //5 minutes
                //store registration data temporarily in metadata
                metadata: {
                    pendingUserData: userData
                }
            });

            const userName = `${userData.firstName} ${userData.lastName}`;
            const replacements = {
                userName: userName,
                otpNumber: otpCode
            };

            const smsResult = await sendSMS(contactNumber, 'registrationOTP.txt', replacements);

            return {
                success: true,
                message: 'Registration OTP sent successfully',
                otpId: otp._id,
                expiresAt: otp.expiresAt,
                contactNumber: contactNumber.replace(/(\d{2})\d{7}(\d{2})/, '$1*******$2'),
                smsResult: smsResult
            };

        } catch (error) {
            throw error;
        }
    }


    async verifyRegistrationOTP(contactNumber, otpCode) {
        try {
            const otpRecord = await OTP.findOne({
                contactNumber: contactNumber,
                otp: otpCode,
                purpose: 'registration',
                isUsed: false
            }).sort({ createdAt: -1 });

            if (!otpRecord) {
                throw new ApiError('Invalid OTP code', 400);
            }

            if (otpRecord.expiresAt < new Date()) {
                throw new ApiError('OTP has expired', 400);
            }

            if (otpRecord.attempts >= otpRecord.maxAttempts) {
                throw new ApiError('Maximum verification attempts exceeded', 400);
            }

            //mark OTP as used
            await otpRecord.markAsUsed();

            //return the pending user data stored in metadata
            return {
                success: true,
                message: 'OTP verified successfully. You can now complete registration.',
                pendingUserData: otpRecord.metadata?.pendingUserData,
                otpId: otpRecord._id
            };

        } catch (error) {
            //if OTP is invalid, increment attempts
            if (error.message !== 'Invalid OTP code') {
                const otpRecord = await OTP.findOne({
                    contactNumber: contactNumber,
                    otp: otpCode,
                    purpose: 'registration',
                    isUsed: false
                }).sort({ createdAt: -1 });

                if (otpRecord && otpRecord.isValid()) {
                    await otpRecord.incrementAttempts();
                    const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
                    
                    if (remainingAttempts > 0) {
                        throw new ApiError(
                            `Invalid OTP code. ${remainingAttempts} attempt(s) remaining`,
                            400
                        );
                    }
                }
            }
            throw error;
        }
    }

    async createAndSendOTP(userId, purpose = 'verification') {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw new ApiError('User not found', 404);
            }

            const contactNumber = user.contactNumber;
            
            if (!contactNumber) {
                throw new ApiError('User has no contact number', 400);
            }

            await OTP.updateMany(
                { 
                    userId: userId, 
                    purpose: purpose,
                    isUsed: false 
                },
                { 
                    isUsed: true,
                    usedAt: new Date()
                }
            );

            const otpCode = this.generateOTP();

            const otp = await OTP.create({
                userId: userId,
                otp: otpCode,
                purpose: purpose,
                contactNumber: contactNumber,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000) //5 minutes
            });

            const userName = `${user.firstName} ${user.lastName}`;
            const replacements = {
                userName: userName,
                otpNumber: otpCode
            };

            const smsResult = await sendSMS(contactNumber, 'otpMessage.txt', replacements);

            return {
                success: true,
                message: 'OTP sent successfully',
                otpId: otp._id,
                expiresAt: otp.expiresAt,
                smsResult: smsResult
            };

        } catch (error) {
            throw error;
        }
    }

    async verifyOTP(userId, otpCode, purpose = 'verification') {
        try {
            const otp = await OTP.findOne({
                userId: userId,
                otp: otpCode,
                purpose: purpose,
                isUsed: false
            }).sort({ createdAt: -1 });

            if (!otp) {
                throw new ApiError('Invalid OTP code', 400);
            }

            if (otp.expiresAt < new Date()) {
                throw new ApiError('OTP has expired', 400);
            }

            if (otp.attempts >= otp.maxAttempts) {
                throw new ApiError('Maximum verification attempts exceeded', 400);
            }

            await otp.markAsUsed();

            return {
                success: true,
                message: 'OTP verified successfully',
                userId: userId
            };

        } catch (error) {
            if (error.statusCode !== 404) {
                const otp = await OTP.findOne({
                    userId: userId,
                    otp: otpCode,
                    purpose: purpose,
                    isUsed: false
                }).sort({ createdAt: -1 });

                if (otp && otp.isValid()) {
                    await otp.incrementAttempts();
                    const remainingAttempts = otp.maxAttempts - otp.attempts;
                    
                    if (remainingAttempts > 0) {
                        throw new ApiError(
                            `Invalid OTP code. ${remainingAttempts} attempt(s) remaining`,
                            400
                        );
                    }
                }
            }
            throw error;
        }
    }

    async resendOTP(userId, purpose = 'verification') {
        try {
            const recentOTP = await OTP.findOne({
                userId: userId,
                purpose: purpose,
                createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
            });

            if (recentOTP) {
                throw new ApiError('Please wait before requesting a new OTP', 429);
            }

            return await this.createAndSendOTP(userId, purpose);

        } catch (error) {
            throw error;
        }
    }

    /**
     * Resend registration OTP
     */
    async resendRegistrationOTP(contactNumber) {
        try {
            const recentOTP = await OTP.findOne({
                contactNumber: contactNumber,
                purpose: 'registration',
                createdAt: { $gte: new Date(Date.now() - 60 * 1000) }
            });

            if (recentOTP) {
                throw new ApiError('Please wait before requesting a new OTP', 429);
            }

            // Get the pending user data from the most recent OTP
            const lastOTP = await OTP.findOne({
                contactNumber: contactNumber,
                purpose: 'registration'
            }).sort({ createdAt: -1 });

            if (!lastOTP || !lastOTP.metadata?.pendingUserData) {
                throw new ApiError('No pending registration found. Please start registration again.', 400);
            }

            return await this.sendRegistrationOTP(contactNumber, lastOTP.metadata.pendingUserData);

        } catch (error) {
            throw error;
        }
    }

    generateTemporaryPassword() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    async forgotPassword(contactNumber) {
        try {
            let normalizedNumber = contactNumber.trim();
            
            let user = await User.findOne({ 
                contactNumber: normalizedNumber,
                role: 'User'
            });

            if (!user && normalizedNumber.startsWith('09')) {
                const withPrefix = '+63' + normalizedNumber.substring(1);
                user = await User.findOne({ 
                    contactNumber: withPrefix,
                    role: 'User'
                });
            }

            if (!user && normalizedNumber.startsWith('+63')) {
                const withoutPrefix = '0' + normalizedNumber.substring(3);
                user = await User.findOne({ 
                    contactNumber: withoutPrefix,
                    role: 'User'
                });
            }

            if (!user) {
                throw new ApiError('No account found with this contact number', 404);
            }

            if (user.isArchived) {
                throw new ApiError('This account has been archived. Please contact support.', 403);
            }

            const temporaryPassword = this.generateTemporaryPassword();

            const hashedPassword = await this.hashPassword(temporaryPassword);

            user.password = hashedPassword;
            await user.save();

            const userName = `${user.firstName} ${user.lastName}`;
            const replacements = {
                userName: userName,
                temporaryPassword: temporaryPassword
            };

            const smsResult = await sendSMS(
                user.contactNumber, 
                'forgotPasswordMessage.txt', 
                replacements
            );

            console.log(`Temporary password sent to ${user.contactNumber} for user ${user.userNumber}`);

            return {
                success: true,
                message: 'A temporary password has been sent to your contact number',
                contactNumber: user.contactNumber.replace(/(\d{2})\d{7}(\d{2})/, '$1*******$2'),
                smsResult: smsResult
            };

        } catch (error) {
            throw error;
        }
    }

    async sendPasswordResetOTP(contactNumber) {
        try {
            let normalizedNumber = contactNumber.trim();
            
            let user = await User.findOne({ 
                contactNumber: normalizedNumber,
                role: 'User'
            });

            if (!user && normalizedNumber.startsWith('09')) {
                const withPrefix = '+63' + normalizedNumber.substring(1);
                user = await User.findOne({ 
                    contactNumber: withPrefix,
                    role: 'User'
                });
            }

            if (!user && normalizedNumber.startsWith('+63')) {
                const withoutPrefix = '0' + normalizedNumber.substring(3);
                user = await User.findOne({ 
                    contactNumber: withoutPrefix,
                    role: 'User'
                });
            }

            if (!user) {
                throw new ApiError('No account found with this contact number', 404);
            }

            if (user.isArchived) {
                throw new ApiError('This account has been archived. Please contact support.', 403);
            }

            const result = await this.createAndSendOTP(user._id, 'password_reset');

            return {
                success: true,
                message: 'Password reset OTP has been sent to your contact number',
                userId: user._id,
                contactNumber: user.contactNumber.replace(/(\d{2})\d{7}(\d{2})/, '$1*******$2'),
                ...result
            };

        } catch (error) {
            throw error;
        }
    }

    async verifyPasswordResetOTP(contactNumber, otp, purpose = 'password_reset') {
        try {
            let normalizedNumber = contactNumber.trim();
            
            let user = await User.findOne({ 
                contactNumber: normalizedNumber,
                role: 'User'
            });

            if (!user && normalizedNumber.startsWith('09')) {
                const withPrefix = '+63' + normalizedNumber.substring(1);
                user = await User.findOne({ 
                    contactNumber: withPrefix,
                    role: 'User'
                });
            }

            if (!user && normalizedNumber.startsWith('+63')) {
                const withoutPrefix = '0' + normalizedNumber.substring(3);
                user = await User.findOne({ 
                    contactNumber: withoutPrefix,
                    role: 'User'
                });
            }

            if (!user) {
                throw new ApiError('No account found with this contact number', 404);
            }

            const otpRecord = await OTP.findOne({
                userId: user._id,
                otp: otp,
                purpose: purpose,
                isUsed: false
            }).sort({ createdAt: -1 });

            if (!otpRecord) {
                throw new ApiError('Invalid OTP code', 400);
            }

            if (otpRecord.expiresAt < new Date()) {
                throw new ApiError('OTP has expired', 400);
            }

            if (otpRecord.attempts >= otpRecord.maxAttempts) {
                throw new ApiError('Maximum verification attempts exceeded', 400);
            }

            await otpRecord.markAsUsed();

            return {
                success: true,
                message: 'OTP verified successfully',
                userId: user._id
            };

        } catch (error) {
            if (error.statusCode !== 404) {
                let user = await User.findOne({ 
                    contactNumber: contactNumber.trim(),
                    role: 'User'
                });

                if (!user && contactNumber.startsWith('09')) {
                    const withPrefix = '+63' + contactNumber.substring(1);
                    user = await User.findOne({ 
                        contactNumber: withPrefix,
                        role: 'User'
                    });
                }

                if (!user && contactNumber.startsWith('+63')) {
                    const withoutPrefix = '0' + contactNumber.substring(3);
                    user = await User.findOne({ 
                        contactNumber: withoutPrefix,
                        role: 'User'
                    });
                }

                if (user) {
                    const otpRecord = await OTP.findOne({
                        userId: user._id,
                        otp: otp,
                        purpose: purpose,
                        isUsed: false
                    }).sort({ createdAt: -1 });

                    if (otpRecord && otpRecord.isValid()) {
                        await otpRecord.incrementAttempts();
                        const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts;
                        
                        if (remainingAttempts > 0) {
                            throw new ApiError(
                                `Invalid OTP code. ${remainingAttempts} attempt(s) remaining`,
                                400
                            );
                        }
                    }
                }
            }
            throw error;
        }
    }

    async resetPasswordWithOTP(contactNumber, otp, newPassword) {
        try {
            let normalizedNumber = contactNumber.trim();
            
            let user = await User.findOne({ 
                contactNumber: normalizedNumber,
                role: 'User'
            });

            if (!user && normalizedNumber.startsWith('09')) {
                const withPrefix = '+63' + normalizedNumber.substring(1);
                user = await User.findOne({ 
                    contactNumber: withPrefix,
                    role: 'User'
                });
            }

            if (!user && normalizedNumber.startsWith('+63')) {
                const withoutPrefix = '0' + normalizedNumber.substring(3);
                user = await User.findOne({ 
                    contactNumber: withoutPrefix,
                    role: 'User'
                });
            }

            if (!user) {
                throw new ApiError('No account found with this contact number', 404);
            }

            const otpRecord = await OTP.findOne({
                userId: user._id,
                otp: otp,
                purpose: 'password_reset',
                isUsed: true,
                usedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
            }).sort({ usedAt: -1 });

            if (!otpRecord) {
                throw new ApiError('Invalid or expired OTP. Please request a new one.', 400);
            }

            const hashedPassword = await this.hashPassword(newPassword);
            user.password = hashedPassword;
            await user.save();

            await OTP.updateMany(
                { 
                    userId: user._id,
                    purpose: 'password_reset',
                    _id: { $ne: otpRecord._id }
                },
                { 
                    isUsed: true,
                    usedAt: new Date()
                }
            );

            return {
                success: true,
                message: 'Password has been reset successfully',
                userId: user._id
            };

        } catch (error) {
            throw error;
        }
    }

    async cleanupExpiredOTPs() {
        try {
            const result = await OTP.deleteMany({
                expiresAt: { $lt: new Date() }
            });

            return {
                success: true,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OTPService();