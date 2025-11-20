const Billing = require('./billing.model');
const MedicalRecord = require('@modules/medical-record/medicalRecord.model');
const InventoryItem = require('@modules/inventory-item/inventoryItem.model');
const mongoose = require('mongoose');

class BillingService {

    async createBilling(billingData) {
        const {
            medicalRecordId,
            patientName,
            itemName,
            itemQuantity,
            itemPrices,
            doctorFee,
            amount,
            paymentStatus,
            medicalRecordDate
        } = billingData;

        if (!medicalRecordId) {
            throw new Error('Medical Record ID is required');
        }

        if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
            throw new Error('Invalid Medical Record ID format');
        }

        if (!amount || amount < 0) {
            throw new Error('Valid amount is required');
        }

        const medicalRecord = await MedicalRecord.findById(medicalRecordId);
        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        if (itemName && itemQuantity && itemPrices) {
            if (itemName.length !== itemQuantity.length || itemName.length !== itemPrices.length) {
                throw new Error('Item names, quantities, and prices must have the same length');
            }
        }

        const newBilling = new Billing({
            medicalRecordId,
            patientName: patientName || medicalRecord.personalDetails?.fullName,
            itemName: itemName || [],
            itemQuantity: itemQuantity || [],
            itemPrices: itemPrices || [],
            doctorFee: doctorFee || 0,
            amount,
            paymentStatus: paymentStatus || 'Unpaid',
            medicalRecordDate: medicalRecordDate || medicalRecord.dateRecorded
        });

        const savedBilling = await newBilling.save();

        if (itemName && itemQuantity) {
            await this.updateInventoryQuantities(itemName, itemQuantity, 'subtract');
        }

        await savedBilling.populate('medicalRecordId', 'personalDetails.fullName dateRecorded');

        return savedBilling;
    }

    async getBillings(queryParams) {
        try {
            const {
                search,
                page,
                limit,
                paymentStatus,
                patientName,
                itemName,
                minAmount,
                maxAmount,
                fromDate,
                toDate,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryParams;

            const filter = {};

            if (paymentStatus && paymentStatus !== 'all') {
                filter.paymentStatus = paymentStatus;
            }

            if (minAmount !== undefined || maxAmount !== undefined) {
                filter.amount = {};
                if (minAmount !== undefined) filter.amount.$gte = Number(minAmount);
                if (maxAmount !== undefined) filter.amount.$lte = Number(maxAmount);
            }

            if (fromDate || toDate) {
                filter.createdAt = {};
                if (fromDate) filter.createdAt.$gte = new Date(fromDate);
                if (toDate) filter.createdAt.$lte = new Date(toDate);
            }

            //search functionality - search across multiple fields
            if (search) {
                filter.$or = [
                    { patientName: { $regex: search, $options: 'i' } },
                    { itemName: { $in: [new RegExp(search, 'i')] } },
                    { paymentStatus: { $regex: search, $options: 'i' } },
                    { medicalRecordId: mongoose.Types.ObjectId.isValid(search) ? search : null }.medicalRecordId ? { medicalRecordId: search } : {}
                ].filter(condition => Object.keys(condition).length > 0);
            }

            if (patientName) {
                filter.patientName = { $regex: patientName, $options: 'i' };
            }
            if (itemName) {
                filter.itemName = { $in: [new RegExp(itemName, 'i')] };
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await Billing.countDocuments(filter);

            const searchTerm = search || patientName || itemName || null;

            let billings;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page) || 1;
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                billings = await Billing.find(filter)
                    .populate('medicalRecordId', 'personalDetails.fullName dateRecorded diagnosis')
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
                billings = await Billing.find(filter)
                    .populate('medicalRecordId', 'personalDetails.fullName dateRecorded diagnosis')
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
                billings,
                pagination,
                count: billings.length
            };
        } catch (error) {
            throw error;
        }
    }

    async getBillingById(billingId) {
        if (!billingId || !mongoose.Types.ObjectId.isValid(billingId)) {
            throw new Error('Invalid billing ID');
        }

        const billing = await Billing.findById(billingId)
            .populate('medicalRecordId', 'personalDetails.fullName dateRecorded diagnosis treatmentPlan');

        if (!billing) {
            throw new Error('Billing record not found');
        }

        return billing;
    }

    async updateBilling(billingId, updateData, isPaymentStatusUpdate = false) {
        if (!billingId || !mongoose.Types.ObjectId.isValid(billingId)) {
            throw new Error('Invalid billing ID');
        }

        const billing = await Billing.findById(billingId);
        if (!billing) {
            throw new Error('Billing record not found');
        }

        if (isPaymentStatusUpdate) {
            billing.paymentStatus = updateData.paymentStatus;
            await billing.save();
            return await billing.populate('medicalRecordId', 'personalDetails.fullName dateRecorded');
        }

        const updatedBilling = await Billing.findByIdAndUpdate(
            billingId,
            updateData,
            { new: true, runValidators: true }
        ).populate('medicalRecordId', 'personalDetails.fullName dateRecorded');

        return updatedBilling;
    }


    async deleteBilling(billingId) {
        if (!billingId || !mongoose.Types.ObjectId.isValid(billingId)) {
            throw new Error('Invalid billing ID');
        }

        const billing = await Billing.findById(billingId);
        if (!billing) {
            throw new Error('Billing record not found');
        }

        if (billing.itemName && billing.itemQuantity) {
            await this.updateInventoryQuantities(billing.itemName, billing.itemQuantity, 'add');
        }

        await Billing.findByIdAndDelete(billingId);

        return billing;
    }

    async getMedicalRecordsForBilling() {
        const medicalRecords = await MedicalRecord.find({})
            .select('personalDetails.fullName dateRecorded diagnosis')
            .sort({ dateRecorded: -1 })
            .limit(50);

        const formattedRecords = medicalRecords.map(record => ({
            id: record._id,
            patientName: record.personalDetails?.fullName || 'Unknown',
            date: record.dateRecorded?.toISOString().split('T')[0] || 'Unknown',
            diagnosis: record.diagnosis || 'No diagnosis'
        }));

        return formattedRecords;
    }

    async getInventoryItemsForBilling() {
        try {
            const currentDate = new Date();
            
            const allItems = await InventoryItem.find({})
                .select('itemName price quantityInStock quantityUsed category expiryDate')
                .sort({ itemName: 1 });
            
            //apply filters - flexible filtering approach
            let inventoryItems = await InventoryItem.find({
                $and: [
                    {
                        $or: [
                            { quantityInStock: { $gt: 0 } },
                            { quantityInStock: { $exists: true, $ne: null, $gte: 1 } }
                        ]
                    },
                    {
                        $or: [
                            { expiryDate: { $gt: currentDate } },
                            { expiryDate: { $exists: false } },
                            { expiryDate: null }
                        ]
                    }
                ]
            })
            .select('itemName price quantityInStock quantityUsed category expiryDate')
            .sort({ itemName: 1 });

            //if no items found with strict filters, try more lenient approach
            if (inventoryItems.length === 0) {
                console.log('No items found with strict filters, trying lenient approach...');
                
                inventoryItems = await InventoryItem.find({
                    quantityInStock: { $gt: 0 }
                })
                .select('itemName price quantityInStock quantityUsed category expiryDate')
                .sort({ itemName: 1 });
            }

            //if still no items, return all items (for development/debugging)
            if (inventoryItems.length === 0) {
                console.log('Still no items, returning all items for debugging...');
                inventoryItems = allItems;
            }

            const formattedItems = inventoryItems.map(item => {
                const availableQty = Math.max(0, (item.quantityInStock || 0) - (item.quantityUsed || 0));
                
                return {
                    name: item.itemName,
                    price: item.price || 0,
                    availableQuantity: availableQty,
                    category: item.category || 'Uncategorized',
                    expiryDate: item.expiryDate,
                    isExpired: item.expiryDate ? item.expiryDate <= currentDate : false
                };
            });

            return formattedItems;

        } catch (error) {
            console.error('Error in getInventoryItemsForBilling service:', error);
            throw error;
        }
    }

    async updateInventoryQuantities(itemNames, itemQuantities, operation) {
        try {
            for (let i = 0; i < itemNames.length; i++) {
                const item = await InventoryItem.findOne({ itemName: itemNames[i] });
                if (item) {
                    if (operation === 'subtract') {
                        item.quantityUsed += itemQuantities[i];
                        item.quantityInStock -= itemQuantities[i];
                    } else if (operation === 'add') {
                        item.quantityUsed -= itemQuantities[i];
                        item.quantityInStock += itemQuantities[i];
                    }
                    await item.save();
                }
            }
        } catch (error) {
            console.error('Error updating inventory quantities:', error);
            throw new Error('Failed to update inventory quantities');
        }
    }

    async checkBillingExists(billingId) {
        if (!mongoose.Types.ObjectId.isValid(billingId)) {
            return false;
        }
        
        const billing = await Billing.findById(billingId);
        return !!billing;
    }

    async countBillings(filter = {}) {
        return await Billing.countDocuments(filter);
    }

    async getBillingsByMedicalRecord(medicalRecordId) {
        if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
            throw new Error('Invalid medical record ID');
        }

        return await Billing.find({ medicalRecordId })
            .populate('medicalRecordId', 'personalDetails.fullName dateRecorded')
            .sort({ createdAt: -1 });
    }

    async getBillingsByPaymentStatus(paymentStatus) {
        const validStatuses = ['Paid', 'Unpaid', 'Partial', 'Pending'];
        if (!validStatuses.includes(paymentStatus)) {
            throw new Error('Invalid payment status');
        }

        return await Billing.find({ paymentStatus })
            .populate('medicalRecordId', 'personalDetails.fullName dateRecorded')
            .sort({ createdAt: -1 });
    }

    async getTotalRevenue(startDate, endDate) {
        const filter = {
            paymentStatus: 'Paid'
        };

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const result = await Billing.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalBillings: { $sum: 1 }
                }
            }
        ]);

        return result[0] || { totalRevenue: 0, totalBillings: 0 };
    }
}

module.exports = new BillingService();