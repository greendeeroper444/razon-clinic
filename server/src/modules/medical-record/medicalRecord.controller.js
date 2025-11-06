const MedicalRecordService = require('./medicalRecord.service');

class MedicalRecordController {

    async addMedicalRecord(req, res, next) {
        try {
            const medicalRecord = await MedicalRecordService.createMedicalRecord(req.body);

            return res.status(201).json({
                success: true,
                message: 'Medical record created successfully',
                data: medicalRecord
            });
        } catch (error) {
            next(error);
        }
    }

    async searchAppointmentsByName(req, res, next) {
        try {
            const { searchTerm } = req.query;
            const results = await MedicalRecordService.searchAppointmentsByName(searchTerm);

            return res.status(200).json({
                success: true,
                message: 'Appointments searched successfully',
                data: {
                    appointments: results,
                    count: results.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getAppointmentForAutofill(req, res, next) {
        try {
            const { appointmentId } = req.params;
            const autofillData = await MedicalRecordService.getAppointmentForAutofill(appointmentId);

            return res.status(200).json({
                success: true,
                message: 'Appointment data retrieved successfully',
                data: autofillData
            });
        } catch (error) {
            next(error);
        }
    }

    async getMedicalRecords(req, res, next) {
        try {
            const isMyMedicalRecordsRoute = req.route.path === '/getMyMedicalRecords';
            
            const queryParams = isMyMedicalRecordsRoute 
                ? { ...req.query, userId: req.user.id }
                : req.query;
            
            const result = await MedicalRecordService.getMedicalRecords(queryParams);

            return res.status(200).json({
                success: true,
                message: 'Medical records retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getMedicalRecordById(req, res, next) {
        try {
            const { medicalRecordId } = req.params;
            const medicalRecord = await MedicalRecordService.getMedicalRecordById(medicalRecordId);

            return res.status(200).json({
                success: true,
                message: 'Medical record retrieved successfully',
                data: medicalRecord
            });
        } catch (error) {
            next(error);
        }
    }

    async updateMedicalRecord(req, res, next) {
        try {
            const { medicalRecordId } = req.params;
            const medicalRecord = await MedicalRecordService.updateMedicalRecord(medicalRecordId, req.body);

            return res.status(200).json({
                success: true,
                message: 'Medical record updated successfully',
                data: medicalRecord
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteMedicalRecord(req, res, next) {
        try {
            const { medicalRecordId } = req.params;
            const medicalRecord = await MedicalRecordService.deleteMedicalRecord(medicalRecordId);

            return res.status(200).json({
                success: true,
                message: 'Medical record deleted successfully',
                data: medicalRecord
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MedicalRecordController();