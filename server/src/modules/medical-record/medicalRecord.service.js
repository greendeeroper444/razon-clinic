const MedicalRecord = require('./medicalRecord.model');
const Appointment = require('@modules/appointment/appointment.model');
const BaseService = require('@services/base.service');
const mongoose = require('mongoose');
const Patient = require('../patient/patient.model');

class MedicalRecordService extends BaseService {

    // ==================== CREATE ====================
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
                fullName,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                bloodType: bloodType || undefined,
                address: address || undefined,
                phone,
                email: email || undefined,
                emergencyContact: emergencyContact || undefined
            },
            medicalHistory: {
                allergies: allergies || undefined,
                chronicConditions: chronicConditions || undefined,
                previousSurgeries: previousSurgeries || undefined,
                familyHistory: familyHistory || undefined
            },
            growthMilestones: {
                height: height ? Number(height) : undefined,
                weight: weight ? Number(weight) : undefined,
                bmi: bmi ? Number(bmi) : undefined,
                growthNotes: growthNotes || undefined
            },
            currentSymptoms: {
                chiefComplaint,
                symptomsDescription,
                symptomsDuration: symptomsDuration || undefined,
                painScale: painScale ? Number(painScale) : undefined
            },
            diagnosis: diagnosis || undefined,
            treatmentPlan: treatmentPlan || undefined,
            prescribedMedications: prescribedMedications || undefined,
            consultationNotes: consultationNotes || undefined,
            followUpDate: followUpDate ? new Date(followUpDate) : undefined,
            vaccinationHistory: vaccinationHistory || undefined
        });

        return await medicalRecord.save();
    }


    // ==================== READ ====================
    async searchAppointmentsByName(searchTerm) {
        const searchRegex = new RegExp(searchTerm.trim(), 'i');

        const appointments = await Appointment.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { middleName: searchRegex },
                { suffix: searchRegex },
                {
                    $expr: {
                        $regexMatch: {
                            input: {
                                $concat: [
                                    "$firstName", " ",
                                    { $ifNull: ["$middleName", ""] },
                                    { $cond: [{ $ne: ["$middleName", null] }, " ", ""] },
                                    "$lastName",
                                    { $cond: [{ $ne: ["$suffix", null] }, " ", ""] },
                                    { $ifNull: ["$suffix", ""] }
                                ]
                            },
                            regex: searchTerm.trim(),
                            options: "i"
                        }
                    }
                }
            ]
        })
        .select('firstName lastName middleName suffix birthdate sex address contactNumber height weight preferredDate preferredTime')
        .limit(10)
        .sort({ createdAt: -1 });

        return appointments.map(appointment => {
            const fullName = `${appointment.firstName} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName}${appointment.suffix ? ' ' + appointment.suffix : ''}`.trim();
            
            return {
                id: appointment._id,
                appointmentId: appointment._id,
                fullName,
                firstName: appointment.firstName,
                lastName: appointment.lastName,
                middleName: appointment.middleName,
                suffix: appointment.suffix,
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
            .select('firstName lastName middleName suffix birthdate sex address contactNumber height weight motherInfo fatherInfo religion preferredDate preferredTime');

        if (!appointment) {
            throw new Error('Appointment not found');
        }

        const fullName = `${appointment.firstName} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName}${appointment.suffix ? ' ' + appointment.suffix : ''}`.trim();
        
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

    async searchPatientsByName(searchTerm) {
        const searchRegex = new RegExp(searchTerm.trim(), 'i');

        const patients = await Patient.find({
            isArchived: false,
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { middleName: searchRegex },
                { suffix: searchRegex },
                {
                    $expr: {
                        $regexMatch: {
                            input: {
                                $concat: [
                                    "$firstName", " ",
                                    { $ifNull: ["$middleName", ""] },
                                    { $cond: [{ $ne: ["$middleName", null] }, " ", ""] },
                                    "$lastName",
                                    { $cond: [{ $ne: ["$suffix", null] }, " ", ""] },
                                    { $ifNull: ["$suffix", ""] }
                                ]
                            },
                            regex: searchTerm.trim(),
                            options: "i"
                        }
                    }
                }
            ]
        })
        .select('firstName lastName middleName suffix birthdate sex address contactNumber height weight preferredDate preferredTime')
        .limit(10)
        .sort({ createdAt: -1 });

        return patients.map(patient => {
            const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}${patient.suffix ? ' ' + patient.suffix : ''}`.trim();
            
            return {
                id: patient._id,
                patientId: patient._id,
                fullName,
                firstName: patient.firstName,
                lastName: patient.lastName,
                middleName: patient.middleName,
                suffix: patient.suffix,
                dateOfBirth: patient.birthdate,
                gender: patient.sex,
                address: patient.address,
                phone: patient.contactNumber?.toString(),
                height: patient.height,
                weight: patient.weight,
                preferredDate: patient.preferredDate,
                preferredTime: patient.preferredTime
            };
        });
    }

    async getPatientForAutofill(patientId) {
        const patient = await Patient.findById(patientId)
            .select('firstName lastName middleName suffix birthdate sex address contactNumber height weight motherInfo fatherInfo religion preferredDate preferredTime');

        if (!patient) {
            throw new Error('Patient not found');
        }

        const fullName = `${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}${patient.suffix ? ' ' + patient.suffix : ''}`.trim();
        
        return {
            patientId: patient._id,
            fullName,
            dateOfBirth: patient.birthdate ? patient.birthdate.toISOString().split('T')[0] : '',
            gender: patient.sex || '',
            address: patient.address || '',
            phone: patient.contactNumber?.toString() || '',
            height: patient.height || '',
            weight: patient.weight || '',
            preferredDate: patient.preferredDate || '',
            preferredTime: patient.preferredTime || ''
        };
    }

    async getMedicalRecords(queryParams) {
        const {
            search, page, limit, fullName, phone, email, gender, bloodType,
            chiefComplaint, diagnosis, fromDate, toDate, userId,
            sortBy = 'createdAt', sortOrder = 'desc'
        } = queryParams;

        //base filter
        const filter = { deletedAt: null };

        //filter by userId if provided (for user-specific routes)
        if (userId) {
            const userAppointments = await mongoose.model('Appointment').find({ userId }).select('_id');
            const appointmentIds = userAppointments.map(apt => apt._id);
            filter.appointmentId = { $in: appointmentIds };
        }

        //date range filter
        const dateFilter = this.buildDateRangeFilter(fromDate, toDate, 'createdAt');
        if (dateFilter) Object.assign(filter, dateFilter);

        //search filter
        if (search) {
            const searchFilter = this.buildSearchFilter(search, [
                'personalDetails.fullName',
                'personalDetails.phone',
                'personalDetails.email',
                'personalDetails.address',
                'currentSymptoms.chiefComplaint',
                'currentSymptoms.symptomsDescription',
                'diagnosis',
                'treatmentPlan',
                'consultationNotes'
            ]);
            Object.assign(filter, searchFilter);
        }

        //specific field filters
        if (fullName) filter['personalDetails.fullName'] = { $regex: fullName, $options: 'i' };
        if (phone) filter['personalDetails.phone'] = { $regex: phone, $options: 'i' };
        if (email) filter['personalDetails.email'] = { $regex: email, $options: 'i' };
        if (gender) filter['personalDetails.gender'] = gender;
        if (bloodType) filter['personalDetails.bloodType'] = bloodType;
        if (chiefComplaint) filter['currentSymptoms.chiefComplaint'] = { $regex: chiefComplaint, $options: 'i' };
        if (diagnosis) filter.diagnosis = { $regex: diagnosis, $options: 'i' };

        const searchTerm = search || fullName || phone || email || chiefComplaint || diagnosis || null;

        const result = await this.paginate(MedicalRecord, filter, {
            page,
            limit,
            sortBy,
            sortOrder,
            populate: {
                path: 'appointmentId',
                select: 'appointmentNumber firstName lastName middleName suffix preferredDate preferredTime status'
            },
            searchTerm
        });

        return {
            medicalRecords: result.data,
            pagination: result.pagination
        };
    }

    async getMedicalRecordById(medicalRecordId) {
        const medicalRecord = await MedicalRecord.findOne({ 
            _id: medicalRecordId, 
            deletedAt: null 
        }).populate('appointmentId', 'appointmentNumber firstName lastName middleName suffix preferredDate preferredTime status reasonForVisit');

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async getDeletedMedicalRecords(queryParams) {
        const {
            search, page, limit, fullName, phone, email, gender, bloodType,
            chiefComplaint, diagnosis, fromDate, toDate,
            sortBy = 'deletedAt', sortOrder = 'desc'
        } = queryParams;

        //base filter
        const filter = { deletedAt: { $ne: null } };

        //date range filter for deletedAt
        const dateFilter = this.buildDateRangeFilter(fromDate, toDate, 'deletedAt');
        if (dateFilter) Object.assign(filter, dateFilter);

        //search filter
        if (search) {
            const searchFilter = this.buildSearchFilter(search, [
                'personalDetails.fullName',
                'personalDetails.phone',
                'personalDetails.email',
                'personalDetails.address',
                'currentSymptoms.chiefComplaint',
                'currentSymptoms.symptomsDescription',
                'diagnosis',
                'treatmentPlan',
                'consultationNotes'
            ]);
            Object.assign(filter, searchFilter);
        }

        //specific field filters
        if (fullName) filter['personalDetails.fullName'] = { $regex: fullName, $options: 'i' };
        if (phone) filter['personalDetails.phone'] = { $regex: phone, $options: 'i' };
        if (email) filter['personalDetails.email'] = { $regex: email, $options: 'i' };
        if (gender) filter['personalDetails.gender'] = gender;
        if (bloodType) filter['personalDetails.bloodType'] = bloodType;
        if (chiefComplaint) filter['currentSymptoms.chiefComplaint'] = { $regex: chiefComplaint, $options: 'i' };
        if (diagnosis) filter.diagnosis = { $regex: diagnosis, $options: 'i' };

        const searchTerm = search || fullName || phone || email || chiefComplaint || diagnosis || null;

        const result = await this.paginate(MedicalRecord, filter, {
            page,
            limit,
            sortBy,
            sortOrder,
            populate: {
                path: 'appointmentId',
                select: 'appointmentNumber firstName lastName middleName suffix preferredDate preferredTime status'
            },
            searchTerm
        });

        return {
            medicalRecords: result.data,
            pagination: result.pagination
        };
    }


    // ==================== UPDATE ====================
    async updateMedicalRecord(medicalRecordId, updateData) {
        if (updateData.appointmentId) {
            const appointmentExists = await Appointment.findById(updateData.appointmentId);
            if (!appointmentExists) {
                throw new Error('Appointment not found');
            }
        }

        const medicalRecord = await MedicalRecord.findOneAndUpdate(
            { _id: medicalRecordId, deletedAt: null },
            updateData,
            { new: true, runValidators: true }
        ).populate('appointmentId', 'appointmentNumber firstName lastName middleName suffix preferredDate preferredTime status');

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async restoreMedicalRecord(medicalRecordId) {
        const medicalRecord = await MedicalRecord.findOneAndUpdate(
            { _id: medicalRecordId, deletedAt: { $ne: null } },
            { deletedAt: null },
            { new: true }
        ).populate('appointmentId', 'appointmentNumber firstName lastName middleName suffix preferredDate preferredTime status');

        if (!medicalRecord) {
            throw new Error('Deleted medical record not found');
        }

        return medicalRecord;
    }

    async bulkRestore(medicalRecordIds) {
        const result = await MedicalRecord.updateMany(
            { 
                _id: { $in: medicalRecordIds },
                deletedAt: { $ne: null }
            },
            { deletedAt: null }
        );

        return {
            restoredCount: result.modifiedCount,
            message: `${result.modifiedCount} medical record(s) restored`
        };
    }


    // ==================== DELETE ====================
    async softDeleteMedicalRecord(medicalRecordId) {
        const medicalRecord = await MedicalRecord.findOneAndUpdate(
            { _id: medicalRecordId, deletedAt: null },
            { deletedAt: new Date() },
            { new: true }
        );

        if (!medicalRecord) {
            throw new Error('Medical record not found');
        }

        return medicalRecord;
    }

    async deleteMedicalRecord(medicalRecordId) {
        const medicalRecord = await MedicalRecord.findOneAndDelete({
            _id: medicalRecordId,
            deletedAt: { $ne: null }
        });

        if (!medicalRecord) {
            throw new Error('Deleted medical record not found');
        }

        return medicalRecord;
    }

    async bulkPermanentDelete(medicalRecordIds) {
        const result = await MedicalRecord.deleteMany({
            _id: { $in: medicalRecordIds },
            deletedAt: { $ne: null }
        });

        return {
            deletedCount: result.deletedCount,
            message: `${result.deletedCount} medical record(s) permanently deleted`
        };
    }


    // ==================== UTILITY ====================
    async checkMedicalRecordExists(medicalRecordId) {
        if (!mongoose.Types.ObjectId.isValid(medicalRecordId)) {
            return false;
        }
        
        return !!(await MedicalRecord.findOne({ _id: medicalRecordId, deletedAt: null }));
    }

    async countMedicalRecords(filter = {}) {
        return await MedicalRecord.countDocuments({ ...filter, deletedAt: null });
    }

    async getMedicalRecordsByAppointmentId(appointmentId) {
        return await MedicalRecord.find({ appointmentId, deletedAt: null })
            .populate('appointmentId', 'appointmentNumber firstName lastName middleName suffix preferredDate preferredTime status')
            .sort({ createdAt: -1 });
    } 
}

module.exports = new MedicalRecordService();