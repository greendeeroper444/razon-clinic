const cron = require('node-cron');
const moment = require('moment-timezone');
const Patient = require('@modules/patient/patient.model');
const logger = require('@utils/logger');

const archiveInactivePatients = cron.schedule('0 2 * * *', async () => {
    try {
        const now = moment().tz('Asia/Singapore');
        const oneYearAgo = now.clone().subtract(1, 'year').toDate();
        
        logger.info(`Running archive job at ${now.format('YYYY-MM-DD HH:mm:ss')}`);
        
        const inactivePatients = await Patient.find({
            updatedAt: { $lte: oneYearAgo },
            isArchived: false
        });
        
        if (inactivePatients.length === 0) {
            logger.info('No inactive patients found to archive');
            return;
        }
        
        //update patients to archived status
        const result = await Patient.updateMany(
            {
                _id: { $in: inactivePatients.map(p => p._id) },
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
        
        logger.info(`Successfully archived ${result.modifiedCount} inactive patients`);
        
        inactivePatients.forEach(patient => {
            logger.info(`Archived patient: ${patient.patientNumber} - ${patient.firstName} ${patient.lastName} (Last active: ${moment(patient.updatedAt).format('YYYY-MM-DD')})`);
        });
        
    } catch (error) {
        logger.error('Error in archive inactive patients job:', error);
    }
}, {
    scheduled: false,
    timezone: 'Asia/Singapore'
});

//start the cron job
const startArchiveJob = () => {
    archiveInactivePatients.start();
    logger.info('Archive inactive patients job started - runs daily at 2:00 AM Singapore time');
};

//stop the cron job
const stopArchiveJob = () => {
    archiveInactivePatients.stop();
    logger.info('Archive inactive patients job stopped');
};

module.exports = {
    archiveInactivePatients,
    startArchiveJob,
    stopArchiveJob
};