require('dotenv').config();
require('module-alias/register');

const { connectDB } = require('@config/database');
const { runMedicineExpirationsJob } = require('./medicineExpirations.job');
// add others as you refactor them, e.g.:
// const { runAppointmentRemindersJob } = require('./appointmentReminders.job');
// const { runMedicineLowStocksJob } = require('./medicineLowStocks.job');

(async () => {
    try {
        await connectDB();
        console.log('DB connected. Running jobs...\n');

        await runMedicineExpirationsJob();
        // await runAppointmentRemindersJob();
        // await runMedicineLowStocksJob();

        console.log('\nAll jobs finished.');
        process.exit(0);
    } catch (err) {
        console.error('Test job runner error:', err);
        process.exit(1);
    }
})();

//to run
// node src/jobs/testJobs.js