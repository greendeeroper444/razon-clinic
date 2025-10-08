const MedicalRecord = require('../models/medicalRecord.model');
const Appointment = require('../models/appointment.model');
const mongoose = require('mongoose');

class MedicalRecordService {

    async createMedicalRecord(medicalRecordData) {
        const {
            appointmentId,
            fullName, dateOfBirth, gender, bloodType, address, phone, email, emergencyContact,
            allergies, chronicConditions, previousSurgeries, familyHistory,
            height, weight, bmi, growthNotes,
            chiefComplaint, symptomsDescription, symptomsDuration, painScale,
            diagnosis, treatmentPlan, prescribedMedications, consultationNotes, followUpDate, vaccinationHistory
        } = medicalRecordData;

        if (appointmentId) {
            const appointmentExists = await Appointment.findById(appointmentId);
            if (!appointmentExists) {
                throw new Error('Appointment not found');
            }
        }

        const medicalRecord = new MedicalRecord({
            appointmentId: appointmentId || undefined,
            personalDetails: {
                fullName, dateOfBirth: new Date(dateOfBirth), gender, bloodType, address, phone, email, emergencyContact
            },
            medicalHistory: { allergies, chronicConditions, previousSurgeries, familyHistory },
            growthMilestones: {
                height: height ? Number(height) : undefined,
                weight: weight ? Number(weight) : undefined,
                bmi: bmi ? Number(bmi) : undefined,
                growthNotes
            },
            currentSymptoms: {
                chiefComplaint, symptomsDescription, symptomsDuration,
                painScale: painScale ? Number(painScale) : undefined
            },
            diagnosis, treatmentPlan, prescribedMedications, consultationNotes,
            followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            vaccinationHistory
        });

        return await medicalRecord.save();
    }

    async searchAppointmentsByName(searchTerm) {
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
                                    "$firstName", " ",
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

        return appointments.map(appointment => {
            const fullName = `${appointment.firstName} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName}`.trim();
            
            return {
                id: appointment._id,
                appointmentId: appointment._id,
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
    }

    async getAppointmentForAutofill(appointmentId) {
        const appointment = await Appointment.findById(appointmentId)
            .select('firstName lastName middleName birthdate sex address contactNumber height weight motherInfo fatherInfo religion preferredDate preferredTime');

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        const fullName = `${appointment.firstName} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName}`.trim();
        
        return {
            appointmentId: appointment._id,
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
        const {
            search, page, limit, fullName, phone, email, gender, bloodType,
            chiefComplaint, diagnosis, fromDate, toDate, userId,
            sortBy = 'createdAt', sortOrder = 'desc'
        } = queryParams;

        const filter = {};

        //filter by userId if provided (for user-specific routes)
        if (userId) {
            const userAppointments = await mongoose.model('Appointment').find({ userId }).select('_id');
            const appointmentIds = userAppointments.map(apt => apt._id);
            
            filter.appointmentId = { $in: appointmentIds };
        }

        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

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

        if (fullName) filter['personalDetails.fullName'] = { $regex: fullName, $options: 'i' };
        if (phone) filter['personalDetails.phone'] = { $regex: phone, $options: 'i' };
        if (email) filter['personalDetails.email'] = { $regex: email, $options: 'i' };
        if (gender) filter['personalDetails.gender'] = gender;
        if (bloodType) filter['personalDetails.bloodType'] = bloodType;
        if (chiefComplaint) filter['currentSymptoms.chiefComplaint'] = { $regex: chiefComplaint, $options: 'i' };
        if (diagnosis) filter.diagnosis = { $regex: diagnosis, $options: 'i' };

        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
        const totalItems = await MedicalRecord.countDocuments(filter);
        const searchTerm = search || fullName || phone || email || chiefComplaint || diagnosis || null;

        let medicalRecords, pagination;

        if (limit && parseInt(limit) > 0) {
            const currentPage = parseInt(page) || 1;
            const itemsPerPage = parseInt(limit);
            const skip = (currentPage - 1) * itemsPerPage;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            medicalRecords = await MedicalRecord.find(filter)
                .populate('appointmentId', 'appointmentNumber firstName lastName middleName preferredDate preferredTime status')
                .sort(sort)
                .skip(skip)
                .limit(itemsPerPage);

            const startIndex = totalItems > 0 ? skip + 1 : 0;
            const endIndex = Math.min(skip + itemsPerPage, totalItems);

            pagination = {
                currentPage, totalPages, totalItems, itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
                startIndex, endIndex, isUnlimited: false,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                previousPage: currentPage > 1 ? currentPage - 1 : null,
                remainingItems: Math.max(0, totalItems - endIndex),
                searchTerm
            };
        } else {
            medicalRecords = await MedicalRecord.find(filter)
                .populate('appointmentId', 'appointmentNumber firstName lastName middleName preferredDate preferredTime status')
                .sort(sort);

            pagination = {
                currentPage: 1, totalPages: 1, totalItems, itemsPerPage: totalItems,
                hasNextPage: false, hasPreviousPage: false,
                startIndex: totalItems > 0 ? 1 : 0, endIndex: totalItems,
                isUnlimited: true, nextPage: null, previousPage: null,
                remainingItems: 0, searchTerm
            };
        }

        return { medicalRecords, pagination };
    }

    async getMedicalRecordById(medicalRecordId) {
        const medicalRecord = await MedicalRecord.findById(medicalRecordId)
            .populate('appointmentId', 'appointmentNumber firstName lastName middleName preferredDate preferredTime status reasonForVisit');

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async updateMedicalRecord(medicalRecordId, updateData) {
        if (updateData.appointmentId) {
            const appointmentExists = await Appointment.findById(updateData.appointmentId);
            if (!appointmentExists) {
                throw new Error('Appointment not found');
            }
        }

        const medicalRecord = await MedicalRecord.findByIdAndUpdate(
            medicalRecordId,
            updateData,
            { new: true, runValidators: true }
        ).populate('appointmentId', 'appointmentNumber firstName lastName middleName preferredDate preferredTime status');

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async deleteMedicalRecord(medicalRecordId) {
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
        
        return !!(await MedicalRecord.findById(medicalRecordId));
    }

    async countMedicalRecords(filter = {}) {
        return await MedicalRecord.countDocuments(filter);
    }

    async getMedicalRecordsByAppointmentId(appointmentId) {
        return await MedicalRecord.find({ appointmentId })
            .populate('appointmentId', 'appointmentNumber firstName lastName middleName preferredDate preferredTime status')
            .sort({ createdAt: -1 });
    } 
}

module.exports = new MedicalRecordService();