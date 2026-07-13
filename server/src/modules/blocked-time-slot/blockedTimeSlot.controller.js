const BlockedTimeSlotService = require("./blockedTimeSlot.service");

class BlockedTimeSlotController {

    async addBlockedTimeSlot(req, res, next) {
        try {
            const createdBy = req.user.id;
            const blockedTimeSlot = await BlockedTimeSlotService.createBlockedTimeSlot(req.body, createdBy);

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
            const blockedTimeSlot = await BlockedTimeSlotService.updateBlockedTimeSlot(blockedTimeSlotId, req.body);

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