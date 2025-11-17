# SEND OTP
POST /api/otp/sendOTP
{
    "userId": "507f1f77bcf86cd799439011",
    "purpose": "verification"
}

# VERIFY OTP
POST /api/otp/verifyOTP
{
    "userId": "507f1f77bcf86cd799439011",
    "otp": "123456",
    "purpose": "verification"
}

# RESEND OTP
POST /api/otp/resendOTP
{
    "userId": "507f1f77bcf86cd799439011",
    "purpose": "verification"
}

# FORGOT PASSWORD
POST /api/otp/forgotPassword
{
    "contactNumber": "09168309254"
}

# SEND PASSWORD RESET (RECOMMENDED)
POST /api/otp/sendPasswordResetOTP

{
    "contactNumber": "09168309254"
}

# RESET PASSWORD WITH OTP
POST /api/otp/resetPasswordWithOTP
{
    "contactNumber": "09168309254",
    "otp": "123456",
    "newPassword": "newSecurePass123",
    "confirmPassword": "newSecurePass123"
}

