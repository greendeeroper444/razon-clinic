const { ApiError } = require('@utils/errors');

class BaseService {
    
    async findUserById(userId, userType, Admin, User, includePassword = false) {
        try {
            let user;
            const selectQuery = includePassword ? '+password' : '';
            
            if (userType === 'admin') {
                user = includePassword 
                    ? await Admin.findById(userId).select(selectQuery)
                    : await Admin.findById(userId);
                    
                if (!user) {
                    throw new ApiError('Admin not found', 404);
                }
            } else {
                user = includePassword 
                    ? await User.findById(userId).select(selectQuery)
                    : await User.findById(userId);
                    
                if (!user) {
                    throw new ApiError('User not found', 404);
                }
            }
            
            return user;
        } catch (error) {
            throw error;
        }
    }


    async findUserByEmailOrContact(emailOrContactNumber, isEmail, Admin, User, includePassword = false) {
        try {
            const query = isEmail 
                ? { email: emailOrContactNumber } 
                : { contactNumber: emailOrContactNumber };
            
            const selectQuery = includePassword ? '+password' : '';
            
            //try addmin first
            let user = includePassword 
                ? await Admin.findOne(query).select(selectQuery)
                : await Admin.findOne(query);
                
            if (user) {
                return { user, userType: 'admin' };
            }
            
            //try user model model
            user = includePassword 
                ? await User.findOne(query).select(selectQuery)
                : await User.findOne(query);
                
            if (user) {
                return { user, userType: 'user' };
            }
            
            return { user: null, userType: null };
        } catch (error) {
            throw error;
        }
    }

    async updateUserProfile(userId, userType, updateData, Admin, User) {
        try {
            //remove sensitive/protected fields
            const protectedFields = ['password', '_id', '__v', 'dateRegistered', 'role', 'userNumber'];
            protectedFields.forEach(field => delete updateData[field]);
            
            let user;
            
            if (userType === 'admin') {
                user = await Admin.findByIdAndUpdate(
                    userId,
                    updateData,
                    { new: true, runValidators: true }
                );
                if (!user) {
                    throw new ApiError('Admin not found', 404);
                }
            } else {
                user = await User.findByIdAndUpdate(
                    userId,
                    updateData,
                    { new: true, runValidators: true }
                );
                if (!user) {
                    throw new ApiError('User not found', 404);
                }
            }
            
            return user;
        } catch (error) {
            throw error;
        }
    }

    formatUserResponse(user, userType = null) {
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            email: user.email,
            contactNumber: user.contactNumber,
            birthdate: user.birthdate,
            sex: user.sex,
            address: user.address,
            religion: user.religion,
            role: user.role
        };

        if (user.userNumber) {
            userResponse.userNumber = user.userNumber;
        }

        if (userType) {
            userResponse.userType = userType;
        }

        if (user.dateRegistered) {
            userResponse.dateRegistered = user.dateRegistered;
        }

        return { user: userResponse };
    }

    
    validateEmailOrContactNumber(emailOrContactNumber) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrContactNumber);
        const isContactNumber = /^(09|\+639)\d{9}$/.test(emailOrContactNumber);
        
        if (!isEmail && !isContactNumber) {
            throw new ApiError('Please provide a valid email or contact number', 400);
        }
        
        return { isEmail, isContactNumber };
    }

    async checkUserExists(emailOrContactNumber, isEmail, User, Admin = null) {
        const query = isEmail 
            ? { email: emailOrContactNumber } 
            : { contactNumber: emailOrContactNumber };
        
        const existingUser = await User.findOne(query);
        if (existingUser) {
            return true;
        }
        
        if (Admin) {
            const existingAdmin = await Admin.findOne(query);
            if (existingAdmin) {
                return true;
            }
        }
        
        return false;
    }
}

module.exports = BaseService;