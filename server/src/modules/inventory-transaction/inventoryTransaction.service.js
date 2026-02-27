const InventoryTransaction = require('./inventoryTransaction.model');
const mongoose = require('mongoose');

class InventoryTransactionService {

    async logTransaction({ inventoryItemId, itemName, category, transactionType, quantity, previousStock, newStock, reason, notes = '', performedBy = null }) {
        try {
            const transaction = new InventoryTransaction({
                inventoryItem: inventoryItemId,
                itemName,
                category,
                transactionType,
                quantity,
                previousStock,
                newStock,
                reason,
                notes,
                performedBy
            });

            return await transaction.save();
        } catch (error) {
            throw error;
        }
    }

    async getTransactions(queryParams) {
        try {
            const {
                page,
                limit,
                search,
                transactionType,
                reason,
                inventoryItemId,
                startDate,
                endDate,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryParams;

            //build filter
            const filter = {};

            if (search) {
                filter.$or = [
                    { itemName: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { notes: { $regex: search, $options: 'i' } }
                ];
            }

            if (transactionType && ['IN', 'OUT'].includes(transactionType)) {
                filter.transactionType = transactionType;
            }

            if (reason) {
                filter.reason = reason;
            }

            if (inventoryItemId && mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                filter.inventoryItem = inventoryItemId;
            }

            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    filter.createdAt.$lte = end;
                }
            }

            //build sort
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await InventoryTransaction.countDocuments(filter);

            let transactions;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page) || 1;
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);

                transactions = await InventoryTransaction.find(filter)
                    .populate('inventoryItem', 'itemName category quantityInStock')
                    .sort(sort)
                    .skip(skip)
                    .limit(itemsPerPage);

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
                    nextPage: currentPage < totalPages ? currentPage + 1 : null,
                    previousPage: currentPage > 1 ? currentPage - 1 : null,
                    remainingItems: Math.max(0, totalItems - endIndex)
                };
            } else {
                transactions = await InventoryTransaction.find(filter)
                    .populate('inventoryItem', 'itemName category quantityInStock')
                    .sort(sort);

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
                    remainingItems: 0
                };
            }

            return { transactions, pagination };
        } catch (error) {
            throw error;
        }
    }

    async getTransactionsByItemId(inventoryItemId, queryParams = {}) {
        try {
            if (!mongoose.Types.ObjectId.isValid(inventoryItemId)) {
                throw new Error('Invalid inventory item ID format');
            }

            return await this.getTransactions({ ...queryParams, inventoryItemId });
        } catch (error) {
            throw error;
        }
    }

    async getTransactionStats() {
        try {
            const [totals, recentActivity] = await Promise.all([
                InventoryTransaction.aggregate([
                    {
                        $group: {
                            _id: '$transactionType',
                            totalQuantity: { $sum: '$quantity' },
                            count: { $sum: 1 }
                        }
                    }
                ]),
                InventoryTransaction.countDocuments({
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                })
            ]);

            const stats = {
                totalIN: 0,
                totalOUT: 0,
                countIN: 0,
                countOUT: 0,
                recentActivity
            };

            totals.forEach(t => {
                if (t._id === 'IN') {
                    stats.totalIN = t.totalQuantity;
                    stats.countIN = t.count;
                } else {
                    stats.totalOUT = t.totalQuantity;
                    stats.countOUT = t.count;
                }
            });

            return stats;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new InventoryTransactionService();