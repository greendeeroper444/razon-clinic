const cron = require('node-cron');
const moment = require('moment-timezone');
const Appointment = require('@modules/appointment/appointment.model');
const sendSMS = require('@utils/smsSender');
const logger = require('@utils/logger');
const { formatDate, formatTimeOnly } = require('@utils/display');

const appointmentRemindersJob = cron.schedule('0 9 * * *', async () => {
    try {
        const now = moment().tz('Asia/Singapore');
        logger.info(`Running appointment reminders job at ${now.format('YYYY-MM-DD HH:mm:ss')}`);
        
        //calculate tomorrow's date range (start and end of day)
        const tomorrow = now.clone().add(1, 'day');
        const startOfTomorrow = tomorrow.clone().startOf('day').toDate();
        const endOfTomorrow = tomorrow.clone().endOf('day').toDate();
        
        //find all scheduled appointments for tomorrow
        const appointmentsTomorrow = await Appointment.find({
            preferredDate: {
                $gte: startOfTomorrow,
                $lte: endOfTomorrow
            },
            status: 'Scheduled'
        }).populate('userId', 'firstName lastName contactNumber');
        
        if (appointmentsTomorrow.length === 0) {
            logger.info('No appointments scheduled for tomorrow. No reminders sent.');
            return;
        }
        
        logger.info(`Found ${appointmentsTomorrow.length} appointment(s) scheduled for tomorrow`);
        
        //send SMS reminder for each appointment
        let successCount = 0;
        let failureCount = 0;
        
        for (const appointment of appointmentsTomorrow) {
            try {
                //get contact number (from appointment or user)
                const contactNumber = appointment.contactNumber || appointment.userId?.contactNumber;
                
                if (!contactNumber) {
                    logger.warn(`No contact number found for appointment ${appointment.appointmentNumber}`);
                    failureCount++;
                    continue;
                }
                
                //format contact number for SMS
                const contactNumberStr = String(contactNumber);
                let smsNumber = contactNumberStr;
                
                if (contactNumberStr.startsWith('09')) {
                    smsNumber = '+63' + contactNumberStr.substring(1);
                } else if (!contactNumberStr.startsWith('+63')) {
                    smsNumber = '+63' + contactNumberStr;
                }
                
                //prepare patient name
                const patientName = appointment.userId?.firstName 
                    ? `${appointment.userId.firstName} ${appointment.userId.lastName}`
                    : `${appointment.firstName} ${appointment.lastName}`;
                
                //prepare replacements for SMS template
                const replacements = {
                    userName: patientName,
                    appointmentNumber: appointment.appointmentNumber,
                    preferredDate: formatDate(appointment.preferredDate),
                    preferredTime: formatTimeOnly(appointment.preferredTime),
                    reasonForVisit: appointment.reasonForVisit || 'General Consultation'
                };
                
                //send SMS using reminder template
                const smsResult = await sendSMS(smsNumber, 'reminderMessage.txt', replacements);
                
                if (smsResult.success) {
                    if (smsResult.reason === 'development_skip') {
                        logger.info(`SMS reminder skipped (dev mode) for appointment ${appointment.appointmentNumber} - ${patientName}`);
                    } else {
                        logger.info(`SMS reminder sent successfully for appointment ${appointment.appointmentNumber} - ${patientName}`);
                    }
                    successCount++;
                } else {
                    logger.error(`Failed to send SMS reminder for appointment ${appointment.appointmentNumber}: ${smsResult.message}`);
                    failureCount++;
                }
                
            } catch (error) {
                logger.error(`Error processing appointment ${appointment.appointmentNumber}:`, error);
                failureCount++;
            }
        }
        
        logger.info(`Appointment reminders job completed. Success: ${successCount}, Failed: ${failureCount}`);
        
    } catch (error) {
        logger.error('Error in appointment reminders job:', error);
    }
}, {
    scheduled: false,
    timezone: 'Asia/Singapore'
});

//start the cron job
const startAppointmentRemindersJob = () => {
    appointmentRemindersJob.start();
    logger.info('Appointment reminders job started - runs daily at 9:00 AM Singapore time');
};

//stop the cron job
const stopAppointmentRemindersJob = () => {
    appointmentRemindersJob.stop();
    logger.info('Appointment reminders job stopped');
};

module.exports = {
    appointmentRemindersJob,
    startAppointmentRemindersJob,
    stopAppointmentRemindersJob
};