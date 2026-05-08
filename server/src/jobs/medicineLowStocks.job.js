const cron = require('node-cron');
const moment = require('moment-timezone');
const InventoryItem = require('@modules/inventory-item/inventoryItem.model');
const Notification = require('@modules/notification/notification.model');
const logger = require('@utils/logger');

const TIMEZONE = 'Asia/Singapore';

const LOW_STOCK_THRESHOLD = 50;
const CRITICAL_STOCK_THRESHOLD = 10;


const getStockLevel = (remaining) => {
    if (remaining <= 0) {
        return { tag: 'out_of_stock', label: 'OUT OF STOCK' };
    }
    if (remaining <= CRITICAL_STOCK_THRESHOLD) {
        return { tag: 'critical', label: 'CRITICAL' };
    }
    return { tag: 'low', label: 'LOW STOCK' };
};

const buildLowStockMessage = (item, remaining) => {
    if (remaining <= 0) {
        return `"${item.itemName}" (${item.category}) is completely out of stock. Please restock immediately.`;
    }
    if (remaining <= CRITICAL_STOCK_THRESHOLD) {
        return `"${item.itemName}" (${item.category}) has critically low stock — only ${remaining} unit${remaining !== 1 ? 's' : ''} remaining. Restock soon.`;
    }
    return `"${item.itemName}" (${item.category}) is running low — ${remaining} unit${remaining !== 1 ? 's' : ''} remaining (threshold: ${LOW_STOCK_THRESHOLD}).`;
};

const createLowStockNotificationIfNotExists = async (item, remaining) => {
    const { tag, label } = getStockLevel(remaining);

    //check for an existing UNREAD notification for this item + stock level tag
    //once an admin reads/resolves it, the next job run will re-notify if still low
    const existing = await Notification.findOne({
        entityId: item._id,
        entityType: 'Inventory',
        type: 'LowStock',
        isRead: false,
        message: { $regex: new RegExp(`\\[${tag}\\]`) }
    });

    if (existing) {
        logger.info(`Low stock notification [${tag}] already exists (unread) for "${item.itemName}". Skipping.`);
        return null;
    }

    const message = `[${tag}] ${buildLowStockMessage(item, remaining)}`;

    const notification = new Notification({
        sourceType: 'System',
        type: 'LowStock',
        entityId: item._id,
        entityType: 'Inventory',
        message,
        isRead: false
    });

    return await notification.save();
};

// ── core logic ─────────────────────────────────────────────────────────────────
const runMedicineLowStocksJob = async () => {
    try {
        const now = moment().tz(TIMEZONE);
        logger.info(`Running medicine low stocks job at ${now.format('YYYY-MM-DD HH:mm:ss')}`);

        //find all active items at or below the low stock threshold
        // quantityRemaining is a virtual: quantityInStock - quantityUsed
        //mongoDB can't filter on virtuals, so we use $expr
        const items = await InventoryItem.find({
            isArchived: false,
            $expr: {
                $lte: [
                    { $subtract: ['$quantityInStock', '$quantityUsed'] },
                    LOW_STOCK_THRESHOLD
                ]
            }
        });

        if (items.length === 0) {
            logger.info('No low stock items found. Nothing to do.');
            return;
        }

        logger.info(`Found ${items.length} item(s) at or below the low stock threshold (${LOW_STOCK_THRESHOLD}).`);

        let successCount = 0;
        let skippedCount = 0;
        let failureCount = 0;

        for (const item of items) {
            try {
                const remaining = item.quantityInStock - item.quantityUsed;
                const { label } = getStockLevel(remaining);

                const notification = await createLowStockNotificationIfNotExists(item, remaining);

                if (notification) {
                    logger.info(`Low stock notification created for "${item.itemName}" [${label}] — ${remaining} unit(s) left`);
                    successCount++;
                } else {
                    skippedCount++;
                }
            } catch (error) {
                logger.error(`Error processing low stock notification for "${item.itemName}" (${item._id}):`, error);
                failureCount++;
            }
        }

        logger.info(
            `Medicine low stocks job completed. Created: ${successCount}, Skipped (unread exists): ${skippedCount}, Failed: ${failureCount}`
        );

    } catch (error) {
        logger.error('Error in medicine low stocks job:', error);
    }
};

// ── cron wiring ────────────────────────────────────────────────────────────────
const medicineLowStocksJob = cron.schedule('30 8 * * *', runMedicineLowStocksJob, {
    scheduled: false,
    timezone: TIMEZONE
});

const startMedicineLowStocksJob = () => {
    medicineLowStocksJob.start();
    logger.info('Medicine low stocks job started - runs daily at 8:30 AM Singapore time');
};

const stopMedicineLowStocksJob = () => {
    medicineLowStocksJob.stop();
    logger.info('Medicine low stocks job stopped');
};

module.exports = {
    runMedicineLowStocksJob,        // for manual/test invocation
    medicineLowStocksJob,
    startMedicineLowStocksJob,
    stopMedicineLowStocksJob
};