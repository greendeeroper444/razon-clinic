const bcrypt = require('bcryptjs');
const { ApiError } = require('../utils/errors');
const BaseService = require('./base.service');
const Admin = require('../models/admin.model');
const User = require('../models/user.model');

class AuthService extends BaseService {

    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async createUser(userData) {
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
            } = userData;

            const { isEmail } = this.validateEmailOrContactNumber(emailOrContactNumber);
            
            const userExists = await this.checkUserExists(emailOrContactNumber, isEmail, User, Admin);
            if (userExists) {
                throw new ApiError('User with this email or contact number already exists', 400);
            }
            
            const hashedPassword = await this.hashPassword(password);
            
            const newUserData = {
                firstName,
                lastName,
                middleName: middleName || null,
                password: hashedPassword,
                birthdate: new Date(birthdate),
                sex,
                address,
                dateRegistered: new Date(),
                role: 'Patient'
            };
            
            if (isEmail) {
                newUserData.email = emailOrContactNumber;
            } else {
                newUserData.contactNumber = emailOrContactNumber;
            }
            
            if (religion) {
                newUserData.religion = religion;
            }
            
            const user = new User(newUserData);
            await user.save();
            
            return this.formatUserResponse(user, 'user');
        } catch (error) {
            throw error;
        }
    }

    async authenticateUser(emailOrContactNumber, password) {
        try {
            const { isEmail } = this.validateEmailOrContactNumber(emailOrContactNumber);
            
            const result = await this.findUserByEmailOrContact(
                emailOrContactNumber, 
                isEmail, 
                Admin, 
                User, 
                true
            );
            
            if (!result.user) {
                throw new ApiError('Invalid credentials', 401);
            }
            
            const isPasswordValid = await bcrypt.compare(password, result.user.password);
            if (!isPasswordValid) {
                throw new ApiError('Invalid credentials', 401);
            }
            
            return this.formatUserResponse(result.user, result.userType);
        } catch (error) {
            throw error;
        }
    }

    async getUserProfile(userId, userType) {
        try {
            const user = await this.findUserById(userId, userType, Admin, User);
            return this.formatUserResponse(user, userType);
        } catch (error) {
            throw error;
        }
    }

    async getRawUserData(userId, userType) {
        try {
            const user = await this.findUserById(userId, userType, Admin, User);
            return user;
        } catch (error) {
            throw error;
        }
    }

    async updateUserProfile(userId, userType, updateData) {
        try {
            const user = await super.updateUserProfile(userId, userType, updateData, Admin, User);
            return this.formatUserResponse(user, userType);
        } catch (error) {
            throw error;
        }
    }

    async changePassword(userId, userType, currentPassword, newPassword) {
        try {
            const user = await this.findUserById(userId, userType, Admin, User, true);
            
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new ApiError('Current password is incorrect', 400);
            }
            
            const hashedNewPassword = await this.hashPassword(newPassword);
            user.password = hashedNewPassword;
            await user.save();
            
            return { message: 'Password changed successfully' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new AuthService();