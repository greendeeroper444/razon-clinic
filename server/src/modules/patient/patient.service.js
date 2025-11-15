const Patient = require("./patient.model");
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { ApiError } = require('@utils/errors');

class PatientService {

    // async createPatient(patientData) {
    //     try {
    //         const patient = new Patient(patientData);
    //         return await patient.save();
    //     } catch (error) {
    //         throw error;
    //     }
    // }
    async createPatient(patientData) {
        const processedData = {
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            middleName: patientData.middleName || undefined,
            email: patientData.email || undefined,
            contactNumber: patientData.contactNumber || undefined,
            birthdate: patientData.birthdate,
            sex: patientData.sex,
            address: patientData.address,
            motherInfo: {
                name: patientData.motherInfo?.name || '',
                age: patientData.motherInfo?.age || null,
                occupation: patientData.motherInfo?.occupation || ''
            },
            fatherInfo: {
                name: patientData.fatherInfo?.name || '',
                age: patientData.fatherInfo?.age || null,
                occupation: patientData.fatherInfo?.occupation || ''
            },
            religion: patientData.religion || ''
        };

        const patient = new Patient(processedData);
        return await patient.save();
    }

    async getPatients(queryParams) {
        const { 
            search,
            page, 
            limit, 
            email,
            firstName,
            lastName,
            patientNumber,
            religion,
            sex,
            fromDate,
            toDate,
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            isArchived
        } = queryParams;

        const filter = {};

        if (isArchived !== undefined && isArchived !== null && isArchived !== '') {
            const archivedValue = isArchived === 'true' || isArchived === true;
            filter.isArchived = archivedValue;
        } else {
            filter.isArchived = false;
        }

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { middleName: { $regex: search, $options: 'i' } },
                { patientNumber: { $regex: search, $options: 'i' } },
                { contactNumber: { $regex: search, $options: 'i' } },
            ];
        }

        if (email) {
            filter.email = { $regex: email, $options: 'i' };
        }
        if (firstName) {
            filter.firstName = { $regex: firstName, $options: 'i' };
        }
        if (lastName) {
            filter.lastName = { $regex: lastName, $options: 'i' };
        }
        if (patientNumber) {
            filter.patientNumber = { $regex: patientNumber, $options: 'i' };
        }
        if (religion) {
            filter.religion = { $regex: religion, $options: 'i' };
        }
        if (sex) {
            filter.sex = sex;
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const totalItems = await Patient.countDocuments(filter);

        const searchTerm = search || firstName || lastName || patientNumber || null;

        let patients;
        let pagination;

        if (limit && parseInt(limit) > 0) {
            const currentPage = parseInt(page) || 1;
            const itemsPerPage = parseInt(limit);
            const skip = (currentPage - 1) * itemsPerPage;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            patients = await Patient.find(filter)
                .populate('archivedBy', 'firstName lastName')
                .sort(sort)
                .skip(skip)
                .limit(itemsPerPage);

            const startIndex = totalItems > 0 ? skip + 1 : 0;
            const endIndex = Math.min(skip + itemsPerPage, totalItems);

            pagination = {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
                startIndex: startIndex,
                endIndex: endIndex,
                isUnlimited: false,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                previousPage: currentPage > 1 ? currentPage - 1 : null,
                remainingItems: Math.max(0, totalItems - endIndex),
                searchTerm: searchTerm
            };
        } else {
            patients = await Patient.find(filter)
                .populate('archivedBy', 'firstName lastName')
                .sort(sort);

            pagination = {
                currentPage: 1,
                totalPages: 1,
                totalItems: totalItems,
                itemsPerPage: totalItems,
                hasNextPage: false,
                hasPreviousPage: false,
                startIndex: totalItems > 0 ? 1 : 0,
                endIndex: totalItems,
                isUnlimited: true,
                nextPage: null,
                previousPage: null,
                remainingItems: 0,
                searchTerm: searchTerm
            };
        }

        return {
            patients,
            pagination
        };
    }

    async getPatientById(patientId) {
        if (!patientId || patientId === 'undefined') {
            throw new Error('Invalid patient ID');
        }

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            throw new Error('Invalid patient ID format');
        }

        const patient = await Patient.findById(patientId);
        
        if (!patient) {
            throw new Error('Patient not found');
        }

        return patient;
    }

    async updatePatient(patientId, updateData) {
        if (!patientId || patientId === 'undefined') {
            throw new Error('Invalid patient ID');
        }

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            throw new Error('Invalid patient ID format');
        }

        //remove fields that shouldn't be updated directly
        const sanitizedData = { ...updateData };
        delete sanitizedData._id;
        delete sanitizedData.__v;
        delete sanitizedData.createdAt;
        delete sanitizedData.updatedAt;

        const patient = await Patient.findByIdAndUpdate(
            patientId,
            sanitizedData,
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!patient) {
            throw new Error('Patient not found');
        }

        return patient;
    }

    async deletePatient(patientId) {
        if (!patientId || patientId === 'undefined') {
            throw new Error('Invalid patient ID');
        }

        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            throw new Error('Invalid patient ID format');
        }

        const patient = await Patient.findByIdAndDelete(patientId);
        
        if (!patient) {
            throw new Error('Patient not found');
        }

        return patient;
    }

    async checkPatientExists(patientId) {
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return false;
        }
        
        const patient = await Patient.findById(patientId);
        return !!patient;
    }

    async getPatientsByFilter(filter) {
        return await Patient.find(filter);
    }

    async countPatients(filter = {}) {
        return await Patient.countDocuments(filter);
    }


    async archivePatient(patientId, archivedByAdminId) {
        try {
            const patient = await Patient.findOne({ _id: patientId });
            
            if (!patient) {
                throw new ApiError('Patient not found', 404);
            }
            
            if (patient.isArchived) {
                throw new ApiError('Patient is already archived', 400);
            }
            
            const now = moment().tz('Asia/Singapore').toDate();
            
            patient.isArchived = true;
            patient.archivedAt = now;
            patient.archivedBy = archivedByAdminId;
            
            await patient.save();
            
            return {
                message: 'Patient archived successfully',
                patient: {
                    id: patient._id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    patientNumber: patient.patientNumber,
                    isArchived: patient.isArchived,
                    archivedAt: patient.archivedAt
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async unarchivePatient(patientId) {
        try {
            const patient = await Patient.findOne({ _id: patientId });
            
            if (!patient) {
                throw new ApiError('Patient not found', 404);
            }
            
            if (!patient.isArchived) {
                throw new ApiError('Patient is not archived', 400);
            }
            
            const now = moment().tz('Asia/Singapore').toDate();
            
            patient.isArchived = false;
            patient.archivedAt = null;
            patient.archivedBy = null;
            patient.lastActiveAt = now; //reset last active date
            
            await patient.save();
            
            return {
                message: 'Patient unarchived successfully',
                patient: {
                    id: patient._id,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    patientNumber: patient.patientNumber,
                    isArchived: patient.isArchived,
                    lastActiveAt: patient.lastActiveAt
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async archiveMultiplePatients(patientIds, archivedByAdminId) {
        try {
            if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
                throw new ApiError('Patient IDs array is required', 400);
            }

            const patients = await Patient.find({ 
                _id: { $in: patientIds },
                isArchived: false 
            });

            if (patients.length === 0) {
                throw new ApiError('No valid patients found to archive', 404);
            }

            const now = moment().tz('Asia/Singapore').toDate();

            const result = await Patient.updateMany(
                { 
                    _id: { $in: patients.map(u => u._id) },
                    isArchived: false
                },
                {
                    $set: {
                        isArchived: true,
                        archivedAt: now,
                        archivedBy: archivedByAdminId
                    }
                }
            );

            return {
                message: `${result.modifiedCount} patient(s) archived successfully`,
                archivedCount: result.modifiedCount,
                requestedCount: patientIds.length,
                skippedCount: patientIds.length - result.modifiedCount
            };
        } catch (error) {
            throw error;
        }
    }

    async unarchiveMultiplePatients(patientIds) {
        try {
            if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
                throw new ApiError('Patient IDs array is required', 400);
            }

            const patients = await Patient.find({ 
                _id: { $in: patientIds },
                isArchived: true 
            });

            if (patients.length === 0) {
                throw new ApiError('No valid archived patients found to unarchive', 404);
            }

            const now = moment().tz('Asia/Singapore').toDate();

            const result = await Patient.updateMany(
                { 
                    _id: { $in: patients.map(u => u._id) },
                    isArchived: true
                },
                {
                    $set: {
                        isArchived: false,
                        lastActiveAt: now
                    },
                    $unset: {
                        archivedAt: "",
                        archivedBy: ""
                    }
                }
            );

            return {
                message: `${result.modifiedCount} patient(s) unarchived successfully`,
                unarchivedCount: result.modifiedCount,
                requestedCount: patientIds.length,
                skippedCount: patientIds.length - result.modifiedCount
            };
        } catch (error) {
            throw error;
        }
    }

    async updateLastActive(patientId) {
        try {
            const now = moment().tz('Asia/Singapore').toDate();
            
            await Patient.findByIdAndUpdate(patientId, {
                lastActiveAt: now
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PatientService();