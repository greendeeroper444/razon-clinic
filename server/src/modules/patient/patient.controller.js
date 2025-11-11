const PatientService = require("./patient.service");


class PatientController {

    async addPatient(req, res, next) {
        try {
            const patient = await PatientService.createPatient(req.body);

            return res.status(201).json({
                success: true,
                message: 'Patient created successfully',
                data: patient
            });
        } catch (error) {
            next(error);
        }
    }

    async getPatients(req, res, next) {
        try {
            const result = await PatientService.getPatients(req.query);

            return res.status(200).json({
                success: true,
                message: 'Patients retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getPatientById(req, res, next) {
        try {
            const { patientId } = req.params;
            const patient = await PatientService.getPatientById(patientId);

            return res.status(200).json({
                success: true,
                message: 'Patient retrieved successfully',
                data: patient
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const patient = await PatientService.updatePatient(patientId, req.body);

            return res.status(200).json({
                success: true,
                message: 'Patient updated successfully',
                data: patient
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const patient = await PatientService.deletePatient(patientId);

            return res.status(200).json({
                success: true,
                message: 'Patient deleted successfully',
                data: patient
            });
        } catch (error) {
            next(error);
        }
    }


    async archivePatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const archivedByAdminId = req.user.id; 
            
            const result = await PatientService.archivePatient(patientId, archivedByAdminId);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async unarchivePatient(req, res, next) {
        try {
            const { patientId } = req.params;
            
            const result = await PatientService.unarchivePatient(patientId);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async archiveMultiplePatients(req, res, next) {
        try {
            const { patientIds } = req.body;
            const archivedByAdminId = req.user.id;
            
            const result = await PatientService.archiveMultiplePatients(patientIds, archivedByAdminId);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async unarchiveMultiplePatients(req, res, next) {
        try {
            const { patientIds } = req.body;
            
            const result = await PatientService.unarchiveMultiplePatients(patientIds);
            
            res.status(200).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PatientController();