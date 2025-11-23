const MedicalRecordService = require('./medicalRecord.service');
const GenerateMedicalRecordFile = require('./generateMedicalRecordFile.helper')

class MedicalRecordController {

    // ==================== READ ====================
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


    // ==================== READ ====================
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

    async searchPatientsByName(req, res, next) {
        try {
            const { searchTerm } = req.query;
            const results = await MedicalRecordService.searchPatientsByName(searchTerm);

            return res.status(200).json({
                success: true,
                message: 'Patients searched successfully',
                data: {
                    patients: results,
                    count: results.length
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getPatientForAutofill(req, res, next) {
        try {
            const { patientId } = req.params;
            const autofillData = await MedicalRecordService.getPatientForAutofill(patientId);

            return res.status(200).json({
                success: true,
                message: 'Patient data retrieved successfully',
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

    async getDeletedMedicalRecords(req, res, next) {
        try {
            const result = await MedicalRecordService.getDeletedMedicalRecords(req.query);

            return res.status(200).json({
                success: true,
                message: 'Deleted medical records retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }


    // ==================== UPDATE ====================
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

    async restoreMedicalRecord(req, res, next) {
        try {
            const { medicalRecordId } = req.params;
            const medicalRecord = await MedicalRecordService.restoreMedicalRecord(medicalRecordId);

            return res.status(200).json({
                success: true,
                message: 'Medical record restored successfully',
                data: medicalRecord
            });
        } catch (error) {
            next(error);
        }
    }

    async bulkRestore(req, res, next) {
        try {
            const { medicalRecordIds } = req.body;

            if (!Array.isArray(medicalRecordIds) || medicalRecordIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'medicalRecordIds array is required and must not be empty'
                });
            }

            const result = await MedicalRecordService.bulkRestore(medicalRecordIds);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: { restoredCount: result.restoredCount }
            });
        } catch (error) {
            next(error);
        }
    }


    // ==================== DELETE ====================
    async softDeleteMedicalRecord(req, res, next) {
        try {
            const { medicalRecordId } = req.params;
            const medicalRecord = await MedicalRecordService.softDeleteMedicalRecord(medicalRecordId);

            return res.status(200).json({
                success: true,
                message: 'Medical record soft deleted successfully',
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
                message: 'Medical record permanently deleted',
                data: medicalRecord
            });
        } catch (error) {
            next(error);
        }
    }

    async bulkPermanentDelete(req, res, next) {
        try {
            const { medicalRecordIds } = req.body;

            if (!Array.isArray(medicalRecordIds) || medicalRecordIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'medicalRecordIds array is required and must not be empty'
                });
            }

            const result = await MedicalRecordService.bulkPermanentDelete(medicalRecordIds);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: { deletedCount: result.deletedCount }
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== EXPORT ====================
    async exportMedicalRecords(req, res, next) {
        try {
            const {
                format = 'csv',
                search,
                fullName,
                phone,
                email,
                gender,
                bloodType,
                chiefComplaint,
                diagnosis,
                fromDate,
                toDate
            } = req.query;

            const queryParams = {
                search,
                fullName,
                phone,
                email,
                gender,
                bloodType,
                chiefComplaint,
                diagnosis,
                fromDate,
                toDate,
                page: null,
                limit: null
            };

            const result = await MedicalRecordService.getMedicalRecords(queryParams);
            const records = result.medicalRecords;

            if (!records || records.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No medical records found to export'
                });
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const formatLower = format.toLowerCase();

            if (formatLower === 'csv') {
                const csvData = GenerateMedicalRecordFile.generateCSV(records);
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="medical_records_${timestamp}.csv"`);
                return res.status(200).send(csvData);
            } else if (formatLower === 'xlsx') {
                const xlsxData = await GenerateMedicalRecordFile.generateXLSX(records);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="medical_records_${timestamp}.xlsx"`);
                return res.status(200).send(xlsxData);
            } else if (formatLower === 'json') {
                const jsonData = GenerateMedicalRecordFile.generateJSON(records);
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="medical_records_${timestamp}.json"`);
                return res.status(200).send(jsonData);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid format. Supported formats: csv, xlsx, json'
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MedicalRecordController();