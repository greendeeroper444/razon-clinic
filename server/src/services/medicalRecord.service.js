const MedicalRecord = require('../models/medicalRecord.model');
const Appointment = require('../models/appointment.model');
const mongoose = require('mongoose');

class MedicalRecordService {

    async createMedicalRecord(medicalRecordData) {
        const {
            //personal details
            fullName,
            dateOfBirth,
            gender,
            bloodType,
            address,
            phone,
            email,
            emergencyContact,
            
            //medical history
            allergies,
            chronicConditions,
            previousSurgeries,
            familyHistory,
            
            //growth milestones
            height,
            weight,
            bmi,
            growthNotes,
            
            //current symptoms
            chiefComplaint,
            symptomsDescription,
            symptomsDuration,
            painScale,
            
            //additional fields
            diagnosis,
            treatmentPlan,
            prescribedMedications,
            consultationNotes,
            followUpDate,
            vaccinationHistory
        } = medicalRecordData;

        if (!fullName || !dateOfBirth || !gender || !phone || !chiefComplaint || !symptomsDescription) {
            throw new Error('Missing required fields');
        }

        const medicalRecord = new MedicalRecord({
            personalDetails: {
                fullName,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                bloodType,
                address,
                phone,
                email,
                emergencyContact
            },
            medicalHistory: {
                allergies,
                chronicConditions,
                previousSurgeries,
                familyHistory
            },
            growthMilestones: {
                height: height ? Number(height) : undefined,
                weight: weight ? Number(weight) : undefined,
                bmi: bmi ? Number(bmi) : undefined,
                growthNotes
            },
            currentSymptoms: {
                chiefComplaint,
                symptomsDescription,
                symptomsDuration,
                painScale: painScale ? Number(painScale) : undefined
            },
            diagnosis,
            treatmentPlan,
            prescribedMedications,
            consultationNotes,
            followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            vaccinationHistory
        });

        return await medicalRecord.save();
    }

    async searchAppointmentsByName(searchTerm) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            throw new Error('Search term must be at least 2 characters long');
        }

        const searchRegex = new RegExp(searchTerm.trim(), 'i');

        const appointments = await Appointment.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { middleName: searchRegex },
                {
                    $expr: {
                        $regexMatch: {
                            input: {
                                $concat: [
                                    "$firstName",
                                    " ",
                                    { $ifNull: ["$middleName", ""] },
                                    { $cond: [{ $ne: ["$middleName", null] }, " ", ""] },
                                    "$lastName"
                                ]
                            },
                            regex: searchTerm.trim(),
                            options: "i"
                        }
                    }
                }
            ]
        })
        .select('firstName lastName middleName birthdate sex address contactNumber height weight preferredDate preferredTime')
        .limit(10)
        .sort({ createdAt: -1 });

        const formattedResults = appointments.map(appointment => {
            const fullName = `${appointment.firstName} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName}`.trim();
            
            return {
                id: appointment._id,
                fullName,
                firstName: appointment.firstName,
                lastName: appointment.lastName,
                middleName: appointment.middleName,
                dateOfBirth: appointment.birthdate,
                gender: appointment.sex,
                address: appointment.address,
                phone: appointment.contactNumber?.toString(),
                height: appointment.height,
                weight: appointment.weight,
                preferredDate: appointment.preferredDate,
                preferredTime: appointment.preferredTime
            };
        });

        return formattedResults;
    }

    async getAppointmentForAutofill(appointmentId) {
        if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new Error('Invalid appointment ID');
        }

        const appointment = await Appointment.findById(appointmentId)
            .select('firstName lastName middleName birthdate sex address contactNumber height weight motherInfo fatherInfo religion preferredDate preferredTime');

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        //format data for medical record form
        const fullName = `${appointment.firstName} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName}`.trim();
        
        return {
            fullName,
            dateOfBirth: appointment.birthdate ? appointment.birthdate.toISOString().split('T')[0] : '',
            gender: appointment.sex || '',
            address: appointment.address || '',
            phone: appointment.contactNumber?.toString() || '',
            height: appointment.height || '',
            weight: appointment.weight || '',
            preferredDate: appointment.preferredDate || '',
            preferredTime: appointment.preferredTime || ''
        };
    }

    async getMedicalRecords(queryParams) {
        try {
            const {
                search,
                page,
                limit,
                fullName,
                phone,
                email,
                gender,
                bloodType,
                chiefComplaint,
                diagnosis,
                fromDate,
                toDate,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryParams;

            const filter = {};

            if (fromDate || toDate) {
                filter.createdAt = {};
                if (fromDate) filter.createdAt.$gte = new Date(fromDate);
                if (toDate) filter.createdAt.$lte = new Date(toDate);
            }

            //search functionality - search across multiple fields
            if (search) {
                filter.$or = [
                    { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                    { 'personalDetails.phone': { $regex: search, $options: 'i' } },
                    { 'personalDetails.email': { $regex: search, $options: 'i' } },
                    { 'personalDetails.address': { $regex: search, $options: 'i' } },
                    { 'currentSymptoms.chiefComplaint': { $regex: search, $options: 'i' } },
                    { 'currentSymptoms.symptomsDescription': { $regex: search, $options: 'i' } },
                    { diagnosis: { $regex: search, $options: 'i' } },
                    { treatmentPlan: { $regex: search, $options: 'i' } },
                    { consultationNotes: { $regex: search, $options: 'i' } }
                ];
            }

            //individual field filters
            if (fullName) {
                filter['personalDetails.fullName'] = { $regex: fullName, $options: 'i' };
            }
            if (phone) {
                filter['personalDetails.phone'] = { $regex: phone, $options: 'i' };
            }
            if (email) {
                filter['personalDetails.email'] = { $regex: email, $options: 'i' };
            }
            if (gender) {
                filter['personalDetails.gender'] = gender;
            }
            if (bloodType) {
                filter['personalDetails.bloodType'] = bloodType;
            }
            if (chiefComplaint) {
                filter['currentSymptoms.chiefComplaint'] = { $regex: chiefComplaint, $options: 'i' };
            }
            if (diagnosis) {
                filter.diagnosis = { $regex: diagnosis, $options: 'i' };
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await MedicalRecord.countDocuments(filter);

            const searchTerm = search || fullName || phone || email || chiefComplaint || diagnosis || null;

            let medicalRecords;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page) || 1;
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                medicalRecords = await MedicalRecord.find(filter)
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
                medicalRecords = await MedicalRecord.find(filter).sort(sort);

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
                medicalRecords,
                pagination
            };
        } catch (error) {
            throw error;
        }
    }

    async getMedicalRecordById(medicalRecordId) {
        if (!medicalRecordId || !mongoose.Types.ObjectId.isValid(medicalRecordId)) {
            throw new Error('Invalid medical record ID');
        }

        const medicalRecord = await MedicalRecord.findById(medicalRecordId);

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async updateMedicalRecord(medicalRecordId, updateData) {
        if (!medicalRecordId || !mongoose.Types.ObjectId.isValid(medicalRecordId)) {
            throw new Error('Invalid medical record ID');
        }

        const medicalRecord = await MedicalRecord.findByIdAndUpdate(
            medicalRecordId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async deleteMedicalRecord(medicalRecordId) {
        if (!medicalRecordId || !mongoose.Types.ObjectId.isValid(medicalRecordId)) {
            throw new Error('Invalid medical record ID');
        }

        const medicalRecord = await MedicalRecord.findByIdAndDelete(medicalRecordId);

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async checkMedicalRecordExists(medicalRecordId) {
        if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
            return false;
        }
        
        const medicalRecord = await MedicalRecord.findById(medicalRecordId);
        return !!medicalRecord;
    }

    async countMedicalRecords(filter = {}) {
        return await MedicalRecord.countDocuments(filter);
    }
}

module.exports = new MedicalRecordService();