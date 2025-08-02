const Patient = require("../../models/patient.model");
const mongoose = require('mongoose')


class PatientController {

    async addPatient(req, res, next) {
        try {
            const { 
                firstName, 
                lastName,
                middleName,
                email, 
                contactNumber, 
                birthdate,
                sex,
                address,
                motherInfo,
                fatherInfo,
                religion
            } = req.body;

            const patientData = {
                firstName,
                lastName,
                middleName,
                email,
                contactNumber,
                birthdate,
                sex,
                address,
                motherInfo: {
                    name: motherInfo?.name || '',
                    age: motherInfo?.age || null,
                    occupation: motherInfo?.occupation || ''
                },
                fatherInfo: {
                    name: fatherInfo?.name || '',
                    age: fatherInfo?.age || null,
                    occupation: fatherInfo?.occupation || ''
                },
                religion: religion || ''
            };

            const patient = new Patient(patientData);

            await patient.save();

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
            const { 
                page = 1, 
                limit = 10, 
                email, 
                firstName,
                religion,
                sortBy = 'createdAt', 
                sortOrder = 'desc' 
            } = req.query;

            //build filter object
            const filter = {};
            if (email) {
                filter.email = { $regex: email, $options: 'i' };
            }
            if (firstName) {
                filter.firstName = { $regex: firstName, $options: 'i' };
            }
            if (religion) {
                filter.religion = { $regex: religion, $options: 'i' };
            }
        
            //calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);

            //build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            // execute query with pagination and sorting
            const patients = await Patient.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            //get total count for pagination
            const totalItems = await Patient.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / parseInt(limit));

            return res.status(200).json({
                success: true,
                message: 'Patients retrieved successfully',
                data: {
                    patients,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages,
                        totalItems,
                        itemsPerPage: parseInt(limit),
                        hasNextPage: parseInt(page) < totalPages,
                        hasPrevPage: parseInt(page) > 1
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getPatientById(req, res, next) {
        try {
            const { patientId } = req.params;

            const patient = await Patient.findById(patientId);

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

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
            const updateData = req.body;

            //remove fields that shouldn't be updated directly
            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const patient = await Patient.findByIdAndUpdate(
                patientId,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            );

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }


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
            
            
            if (!patientId || patientId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid patient ID'
                });
            }
            
            // check if it's a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(patientId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid patient ID format'
                });
            }
            
            const patient = await Patient.findByIdAndDelete(patientId);
            
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Patient deleted successfully',
                data: patient
            });
        } catch (error) {
            next(error);
        }
    }
   
}

module.exports = new PatientController();