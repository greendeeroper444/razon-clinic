// const cron = require('node-cron');
// const moment = require('moment-timezone');
// const InventoryItem = require('@modules/inventory-item/inventoryItem.model');
// const Notification = require('@modules/notification/notification.model');
// const logger = require('@utils/logger');

// //days before expiry to send notifications
// const NOTIFY_DAYS = [10, 5, 3, 1];
// const TIMEZONE = 'Asia/Singapore';


// const buildExpiryMessage = (item, daysRemaining) => {
//     if (daysRemaining === 0) {
//         return `"${item.itemName}" has expired today (${moment(item.expiryDate).format('MMMM D, YYYY')}). Please remove it from stock immediately.`;
//     }
//     return `"${item.itemName}" will expire in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} on ${moment(item.expiryDate).format('MMMM D, YYYY')}. Please take appropriate action.`;
// };


// const createExpiryNotificationIfNotExists = async (item, daysRemaining) => {
//     //use a milestone tag so we don't re-notify for the same day threshold
//     const milestoneTag = daysRemaining === 0 ? 'expired' : `${daysRemaining}d`;

//     //check if a notification already exists for this item + milestone
//     const existing = await Notification.findOne({
//         entityId: item._id,
//         entityType: 'Inventory',
//         type: 'ExpiredItem',
//         //we embed the milestone in the message to distinguish between thresholds.
//         //a cleaner production approach would add a `metadata` field to the schema.
//         message: { $regex: new RegExp(`\\[${milestoneTag}\\]`) }
//     });

//     if (existing) {
//         logger.info(`Expiry notification [${milestoneTag}] already exists for item "${item.itemName}" (${item._id}). Skipping.`);
//         return null;
//     }

//     const message = `[${milestoneTag}] ${buildExpiryMessage(item, daysRemaining)}`;

//     const notification = new Notification({
//         sourceType: 'System',
//         type: 'ExpiredItem',
//         entityId: item._id,
//         entityType: 'Inventory',
//         message,
//         isRead: false
//     });

//     return await notification.save();
// };

// const medicineExpirationsJob = cron.schedule('0 8 * * *', async () => {
//     try {
//         const now = moment().tz(TIMEZONE);
//         logger.info(`Running medicine expirations job at ${now.format('YYYY-MM-DD HH:mm:ss')}`);

//         //build the date targets we care about:
//         // - Today (expired on this exact date)
//         // - 1, 3, 5, 10 days from now
//         const targetDays = [0, ...NOTIFY_DAYS]; // [0, 1, 3, 5, 10]

//         //fetch all active (non-archived) items that expire within the furthest threshold
//         const maxDays = Math.max(...targetDays);
//         const upperBound = now.clone().add(maxDays, 'days').endOf('day').toDate();
//         const lowerBound = now.clone().startOf('day').toDate(); // don't alert on already-past items

//         const items = await InventoryItem.find({
//             isArchived: false,
//             expiryDate: {
//                 $gte: lowerBound,
//                 $lte: upperBound
//             }
//         });

//         if (items.length === 0) {
//             logger.info('No items expiring within the notification window. Nothing to do.');
//             return;
//         }

//         logger.info(`Found ${items.length} item(s) within the expiry notification window.`);

//         let successCount = 0;
//         let skippedCount = 0;
//         let failureCount = 0;

//         for (const item of items) {
//             try {
//                 const expiryMoment = moment(item.expiryDate).tz(TIMEZONE).startOf('day');
//                 const todayMoment = now.clone().startOf('day');
//                 const daysRemaining = expiryMoment.diff(todayMoment, 'days');

//                 // only notify for exact milestone days
//                 if (!targetDays.includes(daysRemaining)) {
//                     continue;
//                 }

//                 const notification = await createExpiryNotificationIfNotExists(item, daysRemaining);

//                 if (notification) {
//                     const label = daysRemaining === 0 ? 'EXPIRED TODAY' : `${daysRemaining} day(s) left`;
//                     logger.info(`Expiry notification created for "${item.itemName}" [${label}]`);
//                     successCount++;
//                 } else {
//                     skippedCount++;
//                 }
//             } catch (error) {
//                 logger.error(`Error processing expiry notification for item "${item.itemName}" (${item._id}):`, error);
//                 failureCount++;
//             }
//         }

//         logger.info(
//             `Medicine expirations job completed. Created: ${successCount}, Skipped (already existed): ${skippedCount}, Failed: ${failureCount}`
//         );

//     } catch (error) {
//         logger.error('Error in medicine expirations job:', error);
//     }
// }, {
//     scheduled: false,
//     timezone: TIMEZONE
// });

// const startMedicineExpirationsJob = () => {
//     medicineExpirationsJob.start();
//     logger.info('Medicine expirations job started - runs daily at 8:00 AM Singapore time');
// };

// const stopMedicineExpirationsJob = () => {
//     medicineExpirationsJob.stop();
//     logger.info('Medicine expirations job stopped');
// };

// module.exports = {
//     medicineExpirationsJob,
//     startMedicineExpirationsJob,
//     stopMedicineExpirationsJob
// };

const cron = require('node-cron');
const moment = require('moment-timezone');
const InventoryItem = require('@modules/inventory-item/inventoryItem.model');
const Notification = require('@modules/notification/notification.model');
const logger = require('@utils/logger');

//days before expiry to send notifications
const NOTIFY_DAYS = [10, 5, 3, 1];
const TIMEZONE = 'Asia/Singapore';

const buildExpiryMessage = (item, daysRemaining) => {
    if (daysRemaining === 0) {
        return `"${item.itemName}" has expired today (${moment(item.expiryDate).format('MMMM D, YYYY')}). Please remove it from stock immediately.`;
    }
    return `"${item.itemName}" will expire in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} on ${moment(item.expiryDate).format('MMMM D, YYYY')}. Please take appropriate action.`;
};

const createExpiryNotificationIfNotExists = async (item, daysRemaining) => {
    const milestoneTag = daysRemaining === 0 ? 'expired' : `${daysRemaining}d`;

    const existing = await Notification.findOne({
        entityId: item._id,
        entityType: 'Inventory',
        type: 'ExpiredItem',
        message: { $regex: new RegExp(`\\[${milestoneTag}\\]`) }
    });

    if (existing) {
        logger.info(`Expiry notification [${milestoneTag}] already exists for item "${item.itemName}" (${item._id}). Skipping.`);
        return null;
    }

    const message = `[${milestoneTag}] ${buildExpiryMessage(item, daysRemaining)}`;

    const notification = new Notification({
        sourceType: 'System',
        type: 'ExpiredItem',
        entityId: item._id,
        entityType: 'Inventory',
        message,
        isRead: false
    });

    return await notification.save();
};

// ── core logic extracted so it can be called directly for testing ──────────────
const runMedicineExpirationsJob = async () => {
    try {
        const now = moment().tz(TIMEZONE);
        logger.info(`Running medicine expirations job at ${now.format('YYYY-MM-DD HH:mm:ss')}`);

        const targetDays = [0, ...NOTIFY_DAYS]; // [0, 1, 3, 5, 10]

        const maxDays = Math.max(...targetDays);
        const upperBound = now.clone().add(maxDays, 'days').endOf('day').toDate();
        const lowerBound = now.clone().startOf('day').toDate();

        const items = await InventoryItem.find({
            isArchived: false,
            expiryDate: {
                $gte: lowerBound,
                $lte: upperBound
            }
        });

        if (items.length === 0) {
            logger.info('No items expiring within the notification window. Nothing to do.');
            return;
        }

        logger.info(`Found ${items.length} item(s) within the expiry notification window.`);

        let successCount = 0;
        let skippedCount = 0;
        let failureCount = 0;

        for (const item of items) {
            try {
                const expiryMoment = moment(item.expiryDate).tz(TIMEZONE).startOf('day');
                const todayMoment = now.clone().startOf('day');
                const daysRemaining = expiryMoment.diff(todayMoment, 'days');

                if (!targetDays.includes(daysRemaining)) {
                    logger.info(`Skipping "${item.itemName}" — ${daysRemaining} day(s) left (not a notify milestone).`);
                    continue;
                }

                const notification = await createExpiryNotificationIfNotExists(item, daysRemaining);

                if (notification) {
                    const label = daysRemaining === 0 ? 'EXPIRED TODAY' : `${daysRemaining} day(s) left`;
                    logger.info(`Expiry notification created for "${item.itemName}" [${label}]`);
                    successCount++;
                } else {
                    skippedCount++;
                }
            } catch (error) {
                logger.error(`Error processing expiry notification for item "${item.itemName}" (${item._id}):`, error);
                failureCount++;
            }
        }

        logger.info(
            `Medicine expirations job completed. Created: ${successCount}, Skipped (already existed): ${skippedCount}, Failed: ${failureCount}`
        );

    } catch (error) {
        logger.error('Error in medicine expirations job:', error);
    }
};

// ── cron wiring ────────────────────────────────────────────────────────────────
const medicineExpirationsJob = cron.schedule('0 8 * * *', runMedicineExpirationsJob, {
    scheduled: false,
    timezone: TIMEZONE
});

const startMedicineExpirationsJob = () => {
    medicineExpirationsJob.start();
    logger.info('Medicine expirations job started - runs daily at 8:00 AM Singapore time');
};

const stopMedicineExpirationsJob = () => {
    medicineExpirationsJob.stop();
    logger.info('Medicine expirations job stopped');
};

module.exports = {
    runMedicineExpirationsJob,   // for manual/test invocation
    medicineExpirationsJob,
    startMedicineExpirationsJob,
    stopMedicineExpirationsJob
};