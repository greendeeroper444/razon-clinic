const { ApiError } = require('@utils/errors');
const BaseService = require('@services/base.service');
const User = require('./user.model');
const moment = require('moment-timezone');

class UserService extends BaseService {

    async getUsers(queryParams) {
        try {
            const {
                search,
                page,
                limit,
                firstName,
                lastName,
                userNumber,
                fromDate,
                toDate,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                isArchived
            } = queryParams;

            const filter = { role: 'User' };

            if (isArchived !== undefined && isArchived !== null && isArchived !== '') {
                const archivedValue = isArchived === 'true' || isArchived === true;
                filter.isArchived = archivedValue;
            }

            if (fromDate || toDate) {
                filter.createdAt = {};
                if (fromDate) filter.createdAt.$gte = new Date(fromDate);
                if (toDate) filter.createdAt.$lte = new Date(toDate);
            }

            if (search) {
                filter.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { userNumber: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { contactNumber: { $regex: search, $options: 'i' } }
                ];
            }

            if (firstName) {
                filter.firstName = { $regex: firstName, $options: 'i' };
            }
            if (lastName) {
                filter.lastName = { $regex: lastName, $options: 'i' };
            }
            if (userNumber) {
                filter.userNumber = { $regex: userNumber, $options: 'i' };
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await User.countDocuments(filter);

            const searchTerm = search || firstName || lastName || userNumber || null;

            let users;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page) || 1;
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                users = await User.find(filter)
                    .select('_id firstName lastName userNumber email contactNumber lastActiveAt createdAt isArchived archivedAt archivedBy')
                    .populate('archivedBy', 'firstName lastName')
                    .sort(sort)
                    .skip(skip)
                    .limit(itemsPerPage)
                    .lean();

                const startIndex = totalItems > 0 ? skip + 1 : 0;
                const endIndex = Math.min(skip + itemsPerPage, totalItems);

                pagination = {
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems,
                    itemsPerPage: itemsPerPage,
                    hasNextPage: currentPage < totalPages,
                    hasPreviousPage: currentPage > 1,
                    startIndex: startIndex,
                    endIndex: endIndex,
                    isUnlimited: false,
                    nextPage: currentPage < totalPages ? currentPage + 1 : null,
                    previousPage: currentPage > 1 ? currentPage - 1 : null,
                    remainingItems: Math.max(0, totalItems - endIndex),
                    searchTerm: searchTerm
                };
            } else {
                users = await User.find(filter)
                    .select('_id firstName lastName userNumber email contactNumber lastActiveAt createdAt isArchived archivedAt archivedBy')
                    .populate('archivedBy', 'firstName lastName')
                    .sort(sort)
                    .lean();

                pagination = {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: totalItems,
                    itemsPerPage: totalItems,
                    hasNextPage: false,
                    hasPreviousPage: false,
                    startIndex: totalItems > 0 ? 1 : 0,
                    endIndex: totalItems,
                    isUnlimited: true,
                    nextPage: null,
                    previousPage: null,
                    remainingItems: 0,
                    searchTerm: searchTerm
                };
            }

            const formattedUsers = users.map(user => ({
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userNumber: user.userNumber,
                email: user.email,
                contactNumber: user.contactNumber,
                lastActiveAt: user.lastActiveAt,
                createdAt: user.createdAt,
                isArchived: user.isArchived,
                archivedAt: user.archivedAt,
                archivedBy: user.archivedBy ? {
                    id: user.archivedBy._id,
                    firstName: user.archivedBy.firstName,
                    lastName: user.archivedBy.lastName
                } : null
            }));

            return {
                users: formattedUsers,
                pagination
            };
        } catch (error) {
            throw error;
        }
    }


    async archiveUser(userId, archivedByUserId) {
        try {
            const user = await User.findOne({ _id: userId, role: 'User' });
            
            if (!user) {
                throw new ApiError('User not found', 404);
            }
            
            if (user.isArchived) {
                throw new ApiError('User is already archived', 400);
            }
            
            const now = moment().tz('Asia/Singapore').toDate();
            
            user.isArchived = true;
            user.archivedAt = now;
            user.archivedBy = archivedByUserId;
            
            await user.save();
            
            return {
                message: 'User archived successfully',
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userNumber: user.userNumber,
                    isArchived: user.isArchived,
                    archivedAt: user.archivedAt
                }
            };
        } catch (error) {
            throw error;
        }
    }


    async getUserById(userId) {
        try {
            const user = await User.findOne({ _id: userId, role: 'User' }).lean();
            
            if (!user) {
                throw new ApiError('User not found', 404);
            }
            
            return {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    contactNumber: user.contactNumber,
                    birthdate: user.birthdate,
                    sex: user.sex,
                    address: user.address
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async archiveUser(userId, archivedByUserId) {
        try {
            const user = await User.findOne({ _id: userId, role: 'User' });
            
            if (!user) {
                throw new ApiError('User not found', 404);
            }
            
            if (user.isArchived) {
                throw new ApiError('User is already archived', 400);
            }
            
            const now = moment().tz('Asia/Singapore').toDate();
            
            user.isArchived = true;
            user.archivedAt = now;
            user.archivedBy = archivedByUserId;
            
            await user.save();
            
            return {
                message: 'User archived successfully',
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userNumber: user.userNumber,
                    isArchived: user.isArchived,
                    archivedAt: user.archivedAt
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async unarchiveUser(userId) {
        try {
            const user = await User.findOne({ _id: userId, role: 'User' });
            
            if (!user) {
                throw new ApiError('User not found', 404);
            }
            
            if (!user.isArchived) {
                throw new ApiError('User is not archived', 400);
            }
            
            const now = moment().tz('Asia/Singapore').toDate();
            
            user.isArchived = false;
            user.archivedAt = null;
            user.archivedBy = null;
            user.lastActiveAt = now; //reset last active date
            
            await user.save();
            
            return {
                message: 'User unarchived successfully',
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userNumber: user.userNumber,
                    isArchived: user.isArchived,
                    lastActiveAt: user.lastActiveAt
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async archiveMultipleUsers(userIds, archivedByUserId) {
        try {
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                throw new ApiError('User IDs array is required', 400);
            }

            const users = await User.find({ 
                _id: { $in: userIds }, 
                role: 'User',
                isArchived: false 
            });

            if (users.length === 0) {
                throw new ApiError('No valid users found to archive', 404);
            }

            const now = moment().tz('Asia/Singapore').toDate();

            const result = await User.updateMany(
                { 
                    _id: { $in: users.map(u => u._id) },
                    role: 'User',
                    isArchived: false
                },
                {
                    $set: {
                        isArchived: true,
                        archivedAt: now,
                        archivedBy: archivedByUserId
                    }
                }
            );

            return {
                message: `${result.modifiedCount} user(s) archived successfully`,
                archivedCount: result.modifiedCount,
                requestedCount: userIds.length,
                skippedCount: userIds.length - result.modifiedCount
            };
        } catch (error) {
            throw error;
        }
    }

    async unarchiveMultipleUsers(userIds) {
        try {
            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                throw new ApiError('User IDs array is required', 400);
            }

            const users = await User.find({ 
                _id: { $in: userIds }, 
                role: 'User',
                isArchived: true 
            });

            if (users.length === 0) {
                throw new ApiError('No valid archived users found to unarchive', 404);
            }

            const now = moment().tz('Asia/Singapore').toDate();

            const result = await User.updateMany(
                { 
                    _id: { $in: users.map(u => u._id) },
                    role: 'User',
                    isArchived: true
                },
                {
                    $set: {
                        isArchived: false,
                        lastActiveAt: now
                    },
                    $unset: {
                        archivedAt: "",
                        archivedBy: ""
                    }
                }
            );

            return {
                message: `${result.modifiedCount} user(s) unarchived successfully`,
                unarchivedCount: result.modifiedCount,
                requestedCount: userIds.length,
                skippedCount: userIds.length - result.modifiedCount
            };
        } catch (error) {
            throw error;
        }
    }

    async updateLastActive(userId) {
        try {
            const now = moment().tz('Asia/Singapore').toDate();
            
            await User.findByIdAndUpdate(userId, {
                lastActiveAt: now
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();