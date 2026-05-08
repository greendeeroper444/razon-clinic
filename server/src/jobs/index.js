const { startArchiveJob, stopArchiveJob } = require('./archiveInActivePatients.job');
const { startArchiveUsersJob, stopArchiveUsersJob } = require('./archiveInActiveUsers.job');
const { startAppointmentRemindersJob, stopAppointmentRemindersJob } = require('./appointmentReminders.job');
const { startMedicineExpirationsJob, stopMedicineExpirationsJob } = require('./medicineExpirations.job');
const { startMedicineLowStocksJob, stopMedicineLowStocksJob } = require('./medicineLowStocks.job');

const startAllJobs = () => {
    startArchiveJob();
    startArchiveUsersJob();
    startAppointmentRemindersJob();
    startMedicineExpirationsJob();
    startMedicineLowStocksJob();
};

const stopAllJobs = () => {
    stopArchiveJob();
    stopArchiveUsersJob();
    stopAppointmentRemindersJob();
    stopMedicineExpirationsJob();
    stopMedicineLowStocksJob();
};

module.exports = {
    startAllJobs,
    stopAllJobs
};