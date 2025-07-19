const Appointment = require('../../models/appointment.model');
const MedicalRecord = require('../../models/medicalRecord.model');

class MedicalRecordController {

    
    async addMedicalRecord(req, res, next) {
        try {
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
            } = req.body;

            //validate required fields
            if (!fullName || !dateOfBirth || !gender || !phone || !chiefComplaint || !symptomsDescription) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            //create medical record
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

            await medicalRecord.save();

            res.status(201).json({
                success: true,
                message: 'Medical record created successfully',
                data: medicalRecord
            });

        } catch (error) {
            console.error('Error creating medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    //search appointments by full name (firstName + lastName + middleName)
    async searchAppointmentsByName(req, res, next) {
        try {
            const { searchTerm } = req.query;

            if (!searchTerm || searchTerm.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term must be at least 2 characters long'
                });
            }

            //create regex for flexible search
            const searchRegex = new RegExp(searchTerm.trim(), 'i');

            //search in appointments collection
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

            //format the results
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

            res.status(200).json({
                success: true,
                data: formattedResults,
                count: formattedResults.length
            });

        } catch (error) {
            console.error('Error searching appointments:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    //get specific appointment details for autofill
    async getAppointmentForAutofill(req, res, next) {
        try {
            const { appointmentId } = req.params;

            const appointment = await Appointment.findById(appointmentId)
                .select('firstName lastName middleName birthdate sex address contactNumber height weight motherInfo fatherInfo religion preferredDate preferredTime');

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            //format data for medical record form
            const fullName = `${appointment.firstName} ${appointment.middleName ? appointment.middleName + ' ' : ''}${appointment.lastName}`.trim();
            
            const autofillData = {
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

            res.status(200).json({
                success: true,
                data: autofillData
            });

        } catch (error) {
            console.error('Error getting appointment for autofill:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    //get all medical records
    async getMedicalRecords(req, res, next) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const skip = (page - 1) * limit;

            let query = {};
            if (search) {
                query = {
                    $or: [
                        { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
                        { 'personalDetails.phone': { $regex: search, $options: 'i' } },
                        { 'personalDetails.email': { $regex: search, $options: 'i' } }
                    ]
                };
            }

            const medicalRecords = await MedicalRecord.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await MedicalRecord.countDocuments(query);

            res.status(200).json({
                success: true,
                data: medicalRecords,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: medicalRecords.length,
                    totalRecords: total
                }
            });

        } catch (error) {
            console.error('Error getting medical records:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    //get medical record by ID
    async getMedicalRecordById(req, res, next) {
        try {
            const { medicalRecordId } = req.params;

            const medicalRecord = await MedicalRecord.findById(medicalRecordId);

            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            res.status(200).json({
                success: true,
                data: medicalRecord
            });

        } catch (error) {
            console.error('Error getting medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    //update medical record
    async updateMedicalRecord(req, res, next) {
        try {
            const { medicalRecordId } = req.params;
            const updateData = req.body;

            const medicalRecord = await MedicalRecord.findByIdAndUpdate(
                medicalRecordId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Medical record updated successfully',
                data: medicalRecord
            });

        } catch (error) {
            console.error('Error updating medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    //delete medical record
    async deleteMedicalRecord(req, res, next) {
        try {
            const { medicalRecordId } = req.params;

            const medicalRecord = await MedicalRecord.findByIdAndDelete(medicalRecordId);

            if (!medicalRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Medical record not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Medical record deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting medical record:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new MedicalRecordController();