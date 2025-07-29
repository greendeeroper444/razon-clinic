const PersonalPatient = require("../../models/PersonalPatient.model");
const mongoose = require('mongoose')


class PersonalPatientController {

    async addPersonalPatient(req, res, next) {
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

            const personalPatientData = {
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

            const personalPatient = new PersonalPatient(personalPatientData);

            await personalPatient.save();

            return res.status(201).json({
                success: true,
                message: 'Personal patient created successfully',
                data: personalPatient
            });
        } catch (error) {
            next(error);
        }
    }


    
    async getPersonalPatient(req, res, next) {
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
            const personalPatients = await PersonalPatient.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit));

            //get total count for pagination
            const totalItems = await PersonalPatient.countDocuments(filter);
            const totalPages = Math.ceil(totalItems / parseInt(limit));

            return res.status(200).json({
                success: true,
                message: 'Personal patients retrieved successfully',
                data: {
                    personalPatients,
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

    async getPersonalPatientById(req, res, next) {
        try {
            const { patientId } = req.params;

            const personalPatient = await PersonalPatient.findById(patientId);

            if (!personalPatient) {
                return res.status(404).json({
                    success: false,
                    message: 'Personal patient not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Personal patient retrieved successfully',
                data: personalPatient
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePersonalPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            const updateData = req.body;

            //remove fields that shouldn't be updated directly
            delete updateData._id;
            delete updateData.__v;
            delete updateData.createdAt;
            delete updateData.updatedAt;

            const personalPatient = await PersonalPatient.findByIdAndUpdate(
                patientId,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            );

            if (!personalPatient) {
                return res.status(404).json({
                    success: false,
                    message: 'Personal patient not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Personal patient updated successfully',
                data: personalPatient
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePersonalPatient(req, res, next) {
        try {
            const { patientId } = req.params;
            
            
            if (!patientId || patientId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Personal patient ID'
                });
            }
            
            // check if it's a valid MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(patientId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid Personal patient ID format'
                });
            }
            
            const personalPatient = await PersonalPatient.findByIdAndDelete(patientId);
            
            if (!personalPatient) {
                return res.status(404).json({
                    success: false,
                    message: 'Personal patient not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Personal patient deleted successfully',
                data: personalPatient
            });
        } catch (error) {
            next(error);
        }
    }
   
}

module.exports = new PersonalPatientController();