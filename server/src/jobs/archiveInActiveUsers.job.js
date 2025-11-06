const cron = require('node-cron');
const moment = require('moment-timezone');
const User = require('@modules/user/user.model');
const logger = require('@utils/logger');

/**
 * archive users who have been inactive for 1 year
 * runs daily at 2:00 AM Singapore time
 */
const archiveInactiveUsers = cron.schedule('0 2 * * *', async () => {
    try {
        const now = moment().tz('Asia/Singapore');
        const oneYearAgo = now.clone().subtract(1, 'year').toDate();
        
        logger.info(`Running archive job at ${now.format('YYYY-MM-DD HH:mm:ss')}`);
        
        const inactiveUsers = await User.find({
            lastActiveAt: { $lte: oneYearAgo },
            isArchived: false,
            role: 'User'
        });
        
        if (inactiveUsers.length === 0) {
            logger.info('No inactive users found to archive');
            return;
        }
        
        //update users to archived status
        const result = await User.updateMany(
            {
                _id: { $in: inactiveUsers.map(u => u._id) },
                isArchived: false
            },
            {
                $set: {
                    isArchived: true,
                    archivedAt: now.toDate(),
                    archivedBy: null // null for automatic archiving
                }
            }
        );
        
        logger.info(`Successfully archived ${result.modifiedCount} inactive users`);
        
        inactiveUsers.forEach(user => {
            logger.info(`Archived user: ${user.userNumber} - ${user.firstName} ${user.lastName} (Last active: ${moment(user.lastActiveAt).format('YYYY-MM-DD')})`);
        });
        
    } catch (error) {
        logger.error('Error in archive inactive users job:', error);
    }
}, {
    scheduled: false,
    timezone: 'Asia/Singapore'
});

//start the cron job
const startArchiveJob = () => {
    archiveInactiveUsers.start();
    logger.info('Archive inactive users job started - runs daily at 2:00 AM Singapore time');
};

//stop the cron job
const stopArchiveJob = () => {
    archiveInactiveUsers.stop();
    logger.info('Archive inactive users job stopped');
};

module.exports = {
    archiveInactiveUsers,
    startArchiveJob,
    stopArchiveJob
};