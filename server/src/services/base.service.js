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
            
            //try admin first
            let user = includePassword 
                ? await Admin.findOne(query).select(selectQuery)
                : await Admin.findOne(query);
                
            if (user) {
                return { user, userType: 'admin' };
            }
            
            //try user model
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

    async paginate(Model, filter = {}, options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            populate = null,
            searchTerm = null
        } = options;

        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const totalItems = await Model.countDocuments(filter);

        let data, pagination;

        if (limit && parseInt(limit) > 0) {
            const currentPage = parseInt(page) || 1;
            const itemsPerPage = parseInt(limit);
            const skip = (currentPage - 1) * itemsPerPage;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            let query = Model.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(itemsPerPage);

            if (populate) {
                if (Array.isArray(populate)) {
                    populate.forEach(pop => {
                        query = query.populate(pop);
                    });
                } else {
                    query = query.populate(populate);
                }
            }

            data = await query;

            const startIndex = totalItems > 0 ? skip + 1 : 0;
            const endIndex = Math.min(skip + itemsPerPage, totalItems);

            pagination = {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
                startIndex,
                endIndex,
                isUnlimited: false,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                previousPage: currentPage > 1 ? currentPage - 1 : null,
                remainingItems: Math.max(0, totalItems - endIndex),
                searchTerm
            };
        } else {
            let query = Model.find(filter).sort(sort);

            if (populate) {
                if (Array.isArray(populate)) {
                    populate.forEach(pop => {
                        query = query.populate(pop);
                    });
                } else {
                    query = query.populate(populate);
                }
            }

            data = await query;

            pagination = {
                currentPage: 1,
                totalPages: 1,
                totalItems,
                itemsPerPage: totalItems,
                hasNextPage: false,
                hasPreviousPage: false,
                startIndex: totalItems > 0 ? 1 : 0,
                endIndex: totalItems,
                isUnlimited: true,
                nextPage: null,
                previousPage: null,
                remainingItems: 0,
                searchTerm
            };
        }

        return { data, pagination };
    }

    buildSearchFilter(search, fields = []) {
        if (!search || !fields.length) return null;

        return {
            $or: fields.map(field => ({
                [field]: { $regex: search, $options: 'i' }
            }))
        };
    }

    buildDateRangeFilter(fromDate, toDate, field = 'createdAt') {
        if (!fromDate && !toDate) return null;

        const dateFilter = {};
        if (fromDate) dateFilter.$gte = new Date(fromDate);
        if (toDate) dateFilter.$lte = new Date(toDate);

        return { [field]: dateFilter };
    }

    mergeFilters(...filters) {
        return filters.reduce((acc, filter) => {
            if (filter) {
                Object.assign(acc, filter);
            }
            return acc;
        }, {});
    }
}

module.exports = BaseService;