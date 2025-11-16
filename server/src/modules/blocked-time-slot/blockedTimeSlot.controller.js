const BlockedTimeSlotService = require("./blockedTimeSlot.service");

class BlockedTimeSlotController {

    async addBlockedTimeSlot(req, res, next) {
        try {
            const { 
                startDate, 
                endDate, 
                startTime,
                endTime, 
                reason,
                customReason
            } = req.body;

            const blockedTimeSlotData = {
                startDate,
                endDate,
                startTime,
                endTime,
                reason,
                customReason,
                createdBy: req.user.id
            };

            await BlockedTimeSlotService.validateBlockedTimeSlotData(blockedTimeSlotData);

            const blockedTimeSlot = await BlockedTimeSlotService.createBlockedTimeSlot(blockedTimeSlotData);

            return res.status(201).json({
                success: true,
                message: 'Blocked time slot created successfully',
                data: blockedTimeSlot
            });
        } catch (error) {
            next(error);
        }
    }

    async getBlockedTimeSlots(req, res, next) {
        try {
            const result = await BlockedTimeSlotService.getBlockedTimeSlots(req.query);

            return res.status(200).json({
                success: true,
                message: 'Blocked time slots retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getBlockedTimeSlotById(req, res, next) {
        try {
            const { blockedTimeSlotId } = req.params;
            const blockedTimeSlot = await BlockedTimeSlotService.getBlockedTimeSlotById(blockedTimeSlotId);

            return res.status(200).json({
                success: true,
                message: 'Blocked time slot retrieved successfully',
                data: blockedTimeSlot
            });
        } catch (error) {
            next(error);
        }
    }

    async updateBlockedTimeSlot(req, res, next) {
        try {
            const { blockedTimeSlotId } = req.params;
            const updateData = req.body;

            const blockedTimeSlot = await BlockedTimeSlotService.updateBlockedTimeSlot(blockedTimeSlotId, updateData);

            return res.status(200).json({
                success: true,
                message: 'Blocked time slot updated successfully',
                data: blockedTimeSlot
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteBlockedTimeSlot(req, res, next) {
        try {
            const { blockedTimeSlotId } = req.params;
            const blockedTimeSlot = await BlockedTimeSlotService.deleteBlockedTimeSlot(blockedTimeSlotId);

            return res.status(200).json({
                success: true,
                message: 'Blocked time slot deleted successfully',
                data: blockedTimeSlot
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BlockedTimeSlotController();