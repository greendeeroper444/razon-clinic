const Billing = require('../../models/billing.model');
const MedicalRecord = require('../../models/medicalRecord.model');
const InventoryItem = require('../../models/inventoryItem.model');

class BillingController {

    async addBilling(req, res, next) {
        try {
            const {
                medicalRecordId,
                patientName,
                itemName,
                itemQuantity,
                itemPrices,
                amount,
                paymentStatus,
                medicalRecordDate
            } = req.body;

            //validate required fields
            if (!medicalRecordId) {
                return res.status(400).json({
                    success: false,
                    message: 'Medical Record ID is required'
                });
            }

            if (!amount || amount < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid amount is required'
                });
            }

            //verify that the medical record exists
            const medicalRecord = await MedicalRecord.findById(medicalRecordId);
            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            //validate arrays have same length if provided
            if (itemName && itemQuantity && itemPrices) {
                if (itemName.length !== itemQuantity.length || itemName.length !== itemPrices.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Item names, quantities, and prices must have the same length'
                    });
                }
            }

            //create new billing record
            const newBilling = new Billing({
                medicalRecordId,
                patientName: patientName || medicalRecord.personalDetails?.fullName,
                itemName: itemName || [],
                itemQuantity: itemQuantity || [],
                itemPrices: itemPrices || [],
                amount,
                paymentStatus: paymentStatus || 'Unpaid',
                medicalRecordDate: medicalRecordDate || medicalRecord.dateRecorded
            });

            //save the billing record
            const savedBilling = await newBilling.save();

            //update inventory quantities if items were used
            if (itemName && itemQuantity) {
                for (let i = 0; i < itemName.length; i++) {
                    const item = await InventoryItem.findOne({ itemName: itemName[i] });
                    if (item) {
                        item.quantityUsed += itemQuantity[i];
                        item.quantityInStock -= itemQuantity[i];
                        await item.save();
                    }
                }
            }

            //populate the medical record reference for response
            await savedBilling.populate('medicalRecordId', 'personalDetails.fullName dateRecorded');

            res.status(201).json({
                success: true,
                message: 'Billing record created successfully',
                data: savedBilling
            });

        } catch (error) {
            console.error('Error creating billing:', error);
            
            //handle validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors
                });
            }

            //handle duplicate key errors
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Duplicate billing record'
                });
            }

            next(error);
        }
    }

    //get all billing records with filtering and pagination
    async getAllBillings(req, res, next) {
        try {
            const { page = 1, limit = 10, paymentStatus, patientName } = req.query;
            
            //build filter object
            const filter = {};
            if (paymentStatus && paymentStatus !== 'all') {
                filter.paymentStatus = paymentStatus;
            }
            if (patientName) {
                filter.patientName = { $regex: patientName, $options: 'i' };
            }

            const billings = await Billing.find(filter)
                .populate('medicalRecordId', 'personalDetails.fullName dateRecorded diagnosis')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Billing.countDocuments(filter);

            res.status(200).json({
                success: true,
                message: 'Billing records retrieved successfully',
                data: billings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('Error fetching billings:', error);
            next(error);
        }
    }

    //get billing by ID
    async getBillingById(req, res, next) {
        try {
            const { billingId } = req.params;

            const billing = await Billing.findById(billingId)
                .populate('medicalRecordId', 'personalDetails.fullName dateRecorded diagnosis treatmentPlan');

            if (!billing) {
                return res.status(404).json({
                    success: false,
                    message: 'Billing record not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Billing record retrieved successfully',
                data: billing
            });

        } catch (error) {
            console.error('Error fetching billing:', error);
            next(error);
        }
    }

    // update billing record
    async updateBilling(req, res, next) {
        try {
            const { billingId } = req.params;
            const updateData = req.body;

            const billing = await Billing.findById(billingId);
            if (!billing) {
                return res.status(404).json({
                    success: false,
                    message: 'Billing record not found'
                });
            }

            //update the billing record
            const updatedBilling = await Billing.findByIdAndUpdate(
                billingId,
                updateData,
                { new: true, runValidators: true }
            ).populate('medicalRecordId', 'personalDetails.fullName dateRecorded');

            res.status(200).json({
                success: true,
                message: 'Billing record updated successfully',
                data: updatedBilling
            });

        } catch (error) {
            console.error('Error updating billing:', error);
            
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors
                });
            }

            next(error);
        }
    }

    //delete billing record
    async deleteBilling(req, res, next) {
        try {
            const { billingId } = req.params;

            const billing = await Billing.findById(billingId);
            if (!billing) {
                return res.status(404).json({
                    success: false,
                    message: 'Billing record not found'
                });
            }

            //if billing had items, restore inventory quantities
            if (billing.itemName && billing.itemQuantity) {
                for (let i = 0; i < billing.itemName.length; i++) {
                    const item = await InventoryItem.findOne({ itemName: billing.itemName[i] });
                    if (item) {
                        item.quantityUsed -= billing.itemQuantity[i];
                        item.quantityInStock += billing.itemQuantity[i];
                        await item.save();
                    }
                }
            }

            await Billing.findByIdAndDelete(billingId);

            res.status(200).json({
                success: true,
                message: 'Billing record deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting billing:', error);
            next(error);
        }
    }

    //get medical records for dropdown
    async getMedicalRecordsForBilling(req, res, next) {
        try {
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

            res.status(200).json({
                success: true,
                message: 'Medical records retrieved successfully',
                data: formattedRecords
            });

        } catch (error) {
            console.error('Error fetching medical records:', error);
            next(error);
        }
    }

    //get inventory items for billing WITH NO FILTER
    // async getInventoryItemsForBilling(req, res, next) {
    //     try {
    //         //simple query without filters for testing
    //         const inventoryItems = await InventoryItem.find({})
    //             .select('itemName price quantityInStock quantityUsed category expiryDate')
    //             .sort({ itemName: 1 });

    //         console.log('Found items:', inventoryItems.length);

    //         const formattedItems = inventoryItems.map(item => ({
    //             name: item.itemName,
    //             price: item.price || 0,
    //             availableQuantity: item.quantityInStock || 0,
    //             category: item.category || 'General'
    //         }));

    //         res.status(200).json({
    //             success: true,
    //             message: 'Inventory items retrieved successfully',
    //             data: formattedItems
    //         });

    //     } catch (error) {
    //         console.error('Error fetching inventory items:', error);
    //         next(error);
    //     }
    // }

    //get inventory items for billing WITH FILTER
    async getInventoryItemsForBilling(req, res, next) {
        try {
            //get current date for comparison
            const currentDate = new Date();
            
            //let's check what items exist first
            const allItems = await InventoryItem.find({})
                .select('itemName price quantityInStock quantityUsed category expiryDate')
                .sort({ itemName: 1 });
            
            allItems.forEach(item => {
                console.log(`Item: ${item.itemName}, Stock: ${item.quantityInStock}, Expiry: ${item.expiryDate}, Expired: ${item.expiryDate <= currentDate}`);
            });

            //aplly filters - let's be more flexible with the filtering
            const inventoryItems = await InventoryItem.find({
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
                            { expiryDate: { $exists: false } }, //include items without expiry date
                            { expiryDate: null } //include items with null expiry date
                        ]
                    }
                ]
            })
            .select('itemName price quantityInStock quantityUsed category expiryDate')
            .sort({ itemName: 1 });

            //if still no items, let's try a more lenient approach
            let finalItems = inventoryItems;
            if (inventoryItems.length === 0) {
                console.log('No items found with strict filters, trying lenient approach...');
                
                //more lenient query - just check for positive stock
                finalItems = await InventoryItem.find({
                    quantityInStock: { $gt: 0 }
                })
                .select('itemName price quantityInStock quantityUsed category expiryDate')
                .sort({ itemName: 1 });
                
                console.log('Lenient filtered items:', finalItems.length);
            }

            //if still no items, get all items (for development/debugging)
            if (finalItems.length === 0) {
                console.log('Still no items, returning all items for debugging...');
                finalItems = allItems;
            }

            const formattedItems = finalItems.map(item => {
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

            res.status(200).json({
                success: true,
                message: 'Inventory items retrieved successfully',
                data: formattedItems
            });

        } catch (error) {
            console.error('Error fetching inventory items:', error);
            next(error);
        }
    }
}

module.exports = BillingController;