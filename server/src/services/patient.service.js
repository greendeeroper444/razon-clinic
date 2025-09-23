const Patient = require("../models/patient.model");
const mongoose = require('mongoose');

class PatientService {

    async createPatient(patientData) {
        try {
            const patient = new Patient(patientData);
            return await patient.save();
        } catch (error) {
            throw error;
        }
    }
    // async createPatient(patientData) {
    //     const processedData = {
    //         firstName: patientData.firstName,
    //         lastName: patientData.lastName,
    //         middleName: patientData.middleName,
    //         email: patientData.email,
    //         contactNumber: patientData.contactNumber,
    //         birthdate: patientData.birthdate,
    //         sex: patientData.sex,
    //         address: patientData.address,
    //         motherInfo: {
    //             name: patientData.motherInfo?.name || '',
    //             age: patientData.motherInfo?.age || null,
    //             occupation: patientData.motherInfo?.occupation || ''
    //         },
    //         fatherInfo: {
    //             name: patientData.fatherInfo?.name || '',
    //             age: patientData.fatherInfo?.age || null,
    //             occupation: patientData.fatherInfo?.occupation || ''
    //         },
    //         religion: patientData.religion || ''
    //     };

    //     const patient = new Patient(processedData);
    //     return await patient.save();
    // }

    async getPatients(queryParams) {
        const { 
            search,
            page, 
            limit, 
            email, 
            firstName,
            religion,
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = queryParams;

        //build filter object
        const filter = {};
        if (search) {
            filter.firstName = { $regex: search, $options: 'i' };
        }
        if (email) {
            filter.email = { $regex: email, $options: 'i' };
        }
        if (firstName) {
            filter.firstName = { $regex: firstName, $options: 'i' };
        }
        if (religion) {
            filter.religion = { $regex: religion, $options: 'i' };
        }

        //build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        //get total count first
        const totalItems = await Patient.countDocuments(filter);

        const searchTerm = search || firstName || null;

        let patients;
        let pagination;

        //check if limit is provided (pagination requested)
        if (limit && parseInt(limit) > 0) {
            //paginated query
            const currentPage = parseInt(page);
            const itemsPerPage = parseInt(limit);
            const skip = (currentPage - 1) * itemsPerPage;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            patients = await Patient.find(filter)
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
            //unlimited query (no pagination)
            patients = await Patient.find(filter).sort(sort);

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
}

module.exports = new PatientService();