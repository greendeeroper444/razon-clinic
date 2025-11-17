const BlockedTimeSlot = require("./blockedTimeSlot.model");
const mongoose = require('mongoose');

class BlockedTimeSlotService {
    
    async createBlockedTimeSlot(blockedTimeSlotData) {
        try {
            const blockedTimeSlot = new BlockedTimeSlot(blockedTimeSlotData);
            return await blockedTimeSlot.save();
        } catch (error) {
            throw error;
        }
    }

    async getBlockedTimeSlots(queryParams) {
        try {
            const {
                search,
                page, 
                limit, 
                reason,
                startDate,
                endDate,
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = queryParams;

            const filter = { isActive: true };
            
            if (search) {
                filter.$or = [
                    { reason: { $regex: search, $options: 'i' } },
                    { customReason: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (reason) {
                filter.reason = reason;
            }
            
            if (startDate || endDate) {
                filter.startDate = {};
                if (startDate) {
                    filter.startDate.$gte = new Date(startDate);
                }
                if (endDate) {
                    filter.startDate.$lte = new Date(endDate);
                }
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await BlockedTimeSlot.countDocuments(filter);

            const searchTerm = search || null;

            let blockedTimeSlots;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page);
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                blockedTimeSlots = await BlockedTimeSlot.find(filter)
                    .populate('createdBy', 'name email')
                    .sort(sort)
                    .skip(skip)
                    .limit(itemsPerPage);

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
                blockedTimeSlots = await BlockedTimeSlot.find(filter)
                    .populate('createdBy', 'name email')
                    .sort(sort);

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

            return {
                blockedTimeSlots,
                pagination
            };
        } catch (error) {
            throw error;
        }
    }

    async getBlockedTimeSlotById(blockedTimeSlotId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(blockedTimeSlotId)) {
                throw new Error('Invalid blocked time slot ID format');
            }

            const blockedTimeSlot = await BlockedTimeSlot.findById(blockedTimeSlotId)
                .populate('createdBy', 'name email');
            
            if (!blockedTimeSlot) {
                throw new Error('Blocked time slot not found');
            }

            return blockedTimeSlot;
        } catch (error) {
            throw error;
        }
    }

    async updateBlockedTimeSlot(blockedTimeSlotId, updateData) {
        try {
            if (!mongoose.Types.ObjectId.isValid(blockedTimeSlotId)) {
                throw new Error('Invalid blocked time slot ID format');
            }

            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            delete updateData.createdBy;

            const blockedTimeSlot = await BlockedTimeSlot.findByIdAndUpdate(
                blockedTimeSlotId,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            ).populate('createdBy', 'name email');

            if (!blockedTimeSlot) {
                throw new Error('Blocked time slot not found');
            }

            return blockedTimeSlot;
        } catch (error) {
            throw error;
        }
    }

    async deleteBlockedTimeSlot(blockedTimeSlotId) {
        try {
            if (!blockedTimeSlotId || blockedTimeSlotId === 'undefined') {
                throw new Error('Invalid blocked time slot ID');
            }

            if (!mongoose.Types.ObjectId.isValid(blockedTimeSlotId)) {
                throw new Error('Invalid blocked time slot ID format');
            }
            
            const blockedTimeSlot = await BlockedTimeSlot.findByIdAndDelete(blockedTimeSlotId);
            
            if (!blockedTimeSlot) {
                throw new Error('Blocked time slot not found');
            }

            return blockedTimeSlot;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new BlockedTimeSlotService();