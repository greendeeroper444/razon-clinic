require('dotenv').config();
require('module-alias/register');

const { connectDB } = require('@config/database');
const { runMedicineExpirationsJob } = require('./medicineExpirations.job');
const { runMedicineLowStocksJob } = require('./medicineLowStocks.job');
// const { runAppointmentRemindersJob } = require('./appointmentReminders.job');

(async () => {
    try {
        await connectDB();
        console.log('DB connected. Running jobs...\n');

        await runMedicineExpirationsJob();
        await runMedicineLowStocksJob();
        // await runAppointmentRemindersJob();

        console.log('\nAll jobs finished.');
        process.exit(0);
    } catch (err) {
        console.error('Test job runner error:', err);
        process.exit(1);
    }
})();

//to run
// node src/jobs/testJobs.js