const InventoryTransactionService = require('./inventoryTransaction.service');

class InventoryTransactionController {

    async getTransactions(req, res, next) {
        try {
            const result = await InventoryTransactionService.getTransactions(req.query);

            return res.status(200).json({
                success: true,
                message: 'Transactions retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getTransactionsByItemId(req, res, next) {
        try {
            const { inventoryItemId } = req.params;
            const result = await InventoryTransactionService.getTransactionsByItemId(inventoryItemId, req.query);

            return res.status(200).json({
                success: true,
                message: 'Item transactions retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getTransactionStats(req, res, next) {
        try {
            const stats = await InventoryTransactionService.getTransactionStats();

            return res.status(200).json({
                success: true,
                message: 'Transaction statistics retrieved successfully',
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InventoryTransactionController();