const OnlinePatient = require("../../models/onlinePatient.model");
const { ApiError } = require("../../utils/errors");


class OnlinePatientController {

    async getAllOnlinePatient(req, res, next) {
        try {
            //filter out sensitive data
            const onlinePatients = await OnlinePatient.find().select('firstName lastName email contactNumber createdAt');
            
            //return onlinePatients list
            res.status(200).json({
                status: 'success',
                results: onlinePatients.length,
                data: {
                    onlinePatients
                }
            });
        } catch (error) {
            next(error);
        }
    };
    
    async getPatients(req, res, next) {
        try {
            //only find OnlinePatients with role 'Patient'
            const patients = await OnlinePatient.find({ role: 'Patient' })
                .select('_id firstName lastName patientNumber')
                .lean();
            
            //format the data for the dropdown
            const formattedPatients = patients.map(patient => ({
                id: patient._id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                patientNumber: patient.patientNumber
            }));
            
            //return patients list
            res.status(200).json({
                status: 'success',
                results: formattedPatients.length,
                data: {
                    patients: formattedPatients
                }
            });
        } catch (error) {
            next(error);
        }
    };
    
    async getPatientById(req, res, next) {
        try {
            const { id } = req.params;
            
            //find patient by ID
            const patient = await OnlinePatient.findOne({ _id: id, role: 'Patient' });
            
            if (!patient) {
                throw new ApiError('Patient not found', 404);
            }
            
            //return patient data
            res.status(200).json({
                status: 'success',
                data: {
                    patient: {
                        id: patient._id,
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        email: patient.email,
                        contactNumber: patient.contactNumber,
                        birthdate: patient.birthdate,
                        sex: patient.sex,
                        address: patient.address
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new OnlinePatientController();