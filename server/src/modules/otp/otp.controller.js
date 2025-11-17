const OTPService = require('./otp.service');

class OTPController {

    async sendOTP(req, res, next) {
        try {
            const { userId, purpose } = req.body;

            const result = await OTPService.createAndSendOTP(
                userId, 
                purpose || 'verification'
            );

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    otpId: result.otpId,
                    expiresAt: result.expiresAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyOTP(req, res, next) {
        try {
            const { userId, otp, purpose } = req.body;

            const result = await OTPService.verifyOTP(
                userId, 
                otp, 
                purpose || 'verification'
            );

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    userId: result.userId,
                    verified: true
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async resendOTP(req, res, next) {
        try {
            const { userId, purpose } = req.body;

            const result = await OTPService.resendOTP(
                userId, 
                purpose || 'verification'
            );

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    otpId: result.otpId,
                    expiresAt: result.expiresAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { contactNumber } = req.body;

            const result = await OTPService.forgotPassword(contactNumber);

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    contactNumber: result.contactNumber
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async sendPasswordResetOTP(req, res, next) {
        try {
            const { contactNumber } = req.body;

            const result = await OTPService.sendPasswordResetOTP(contactNumber);

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    userId: result.userId,
                    contactNumber: result.contactNumber,
                    otpId: result.otpId,
                    expiresAt: result.expiresAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyPasswordResetOTP(req, res, next) {
        try {
            const { contactNumber, otp, purpose } = req.body;

            const result = await OTPService.verifyPasswordResetOTP(
                contactNumber,
                otp, 
                purpose || 'password_reset'
            );

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    userId: result.userId,
                    verified: true
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPasswordWithOTP(req, res, next) {
        try {
            const { contactNumber, otp, newPassword } = req.body;

            const result = await OTPService.resetPasswordWithOTP(
                contactNumber, 
                otp, 
                newPassword
            );

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    userId: result.userId
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OTPController();