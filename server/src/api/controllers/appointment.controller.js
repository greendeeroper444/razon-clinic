const Admin = require('../../models/admin.model');
const OnlinePatient = require('../../models/onlinePatient.model');
const Notification = require('../../models/notification.model');
const Appointment = require('../../models/appointment.model');
const { ApiError } = require('../../utils/errors');
const sendSMS = require('../../utils/smsSender');

class AppointmentController {

    async addAppointment(req, res, next) {
        try {
            const createNotifications = !req.user || req.user.role === 'Patient';
            
            //check specifically for reasonForVisit
            if (!req.body.reasonForVisit || req.body.reasonForVisit.trim().length < 5 || 
                req.body.reasonForVisit.trim().length > 200) {
                console.log(`Invalid reasonForVisit length: ${req.body.reasonForVisit ? 
                    req.body.reasonForVisit.trim().length : 0} characters`);
                return res.status(400).json({
                    success: false,
                    message: 'Reason for visit must be between 5 and 200 characters'
                });
            }

            //extract patients array from request body
            const { patients = [], ...appointmentInfo } = req.body;
            
            //if no patients array, create one with the primary patient data
            const patientsToProcess = patients.length > 0 ? patients : [{
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                middleName: req.body.middleName,
                birthdate: req.body.birthdate,
                sex: req.body.sex,
                height: req.body.height,
                weight: req.body.weight
            }];

            //validate that we have at least one patient
            if (patientsToProcess.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one patient is required'
                });
            }

            //validate each patient's required fields
            for (let i = 0; i < patientsToProcess.length; i++) {
                const patient = patientsToProcess[i];
                
                if (!patient.birthdate) {
                    return res.status(400).json({
                        success: false,
                        message: `Birth date is required for patient ${i + 1}`
                    });
                }

                if (!patient.sex || !['Male', 'Female'].includes(patient.sex)) {
                    return res.status(400).json({
                        success: false,
                        message: `Valid sex selection is required for patient ${i + 1}`
                    });
                }
            }

            // //normalize time format - ensure minutes are always :00
            // let preferredTime = req.body.preferredTime;
            // if (preferredTime && !preferredTime.endsWith(':00')) {
            //     const hour = preferredTime.split(':')[0];
            //     preferredTime = `${hour}:00`;
            // }

            // //validate time format (must be in HH:00 format)
            // const timeRegex = /^([0-1]?[0-9]|2[0-3]):00$/;
            // if (!timeRegex.test(preferredTime)) {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'Invalid time format. Time must be in HH:00 format (e.g., 08:00, 14:00)'
            //     });
            // }

            // //validate business hours (8:00 AM to 5:00 PM)
            // const hour = parseInt(preferredTime.split(':')[0]);
            // if (hour < 8 || hour > 17) {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'Appointments are only available between 8:00 AM and 5:00 PM'
            //     });
            // }

            // //check for appointment conflicts
            // const preferredDate = new Date(req.body.preferredDate);
            // const startOfDay = new Date(preferredDate);
            // startOfDay.setHours(0, 0, 0, 0);
            // const endOfDay = new Date(preferredDate);
            // endOfDay.setHours(23, 59, 59, 999);

            // const conflictingAppointment = await Appointment.findOne({
            //     preferredDate: {
            //         $gte: startOfDay,
            //         $lte: endOfDay
            //     },
            //     preferredTime: preferredTime,
            //     status: { $ne: 'Cancelled' } // exclude cancelled appointments
            // });

            // if (conflictingAppointment) {
            //     return res.status(409).json({
            //         success: false,
            //         message: `This time slot (${preferredTime} on ${req.body.preferredDate}) is already booked. Please choose a different time.`
            //     });
            // }


            //15 minutes intervals
            //extract preferredTime from request
            let preferredTime = req.body.preferredTime;

            //validate time format: must be in HH:MM format, and MM should be 00, 15, 30, or 45
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/;
            if (!timeRegex.test(preferredTime)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid time format. Time must be in HH:MM format using 15-minute intervals (e.g., 08:00, 08:15, 08:30, 08:45).'
                });
            }

            //validate business hours (between 08:00 and 17:00)
            const [hourStr, minuteStr] = preferredTime.split(':');
            const hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);

            if (hour < 8 || (hour === 17 && minute > 0) || hour > 17) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointments are only available between 08:00 and 17:00.'
                });
            }

            //check for appointment conflicts on the same date and time
            const preferredDate = new Date(req.body.preferredDate);
            const startOfDay = new Date(preferredDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(preferredDate);
            endOfDay.setHours(23, 59, 59, 999);

            const conflictingAppointment = await Appointment.findOne({
                preferredDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                preferredTime: preferredTime,
                status: { $ne: 'Cancelled' }
            });

            if (conflictingAppointment) {
                return res.status(409).json({
                    success: false,
                    message: `This time slot (${preferredTime} on ${req.body.preferredDate}) is already booked. Please choose a different time.`
                });
            }

            const createdAppointments = [];
            
            //create appointments for each patient
            for (let i = 0; i < patientsToProcess.length; i++) {
                const patient = patientsToProcess[i];
                
                const appointmentData = {
                    patientId: req.body.patientId,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    middleName: patient.middleName || null,
                    preferredDate: req.body.preferredDate,
                    preferredTime: preferredTime,
                    reasonForVisit: req.body.reasonForVisit?.trim(),
                    status: 'Pending',
                    //patient information fields
                    birthdate: patient.birthdate,
                    sex: patient.sex,
                    height: patient.height ? Number(patient.height) : undefined,
                    weight: patient.weight ? Number(patient.weight) : undefined,
                    religion: req.body.religion?.trim(),
                    //mother's information (shared across all patients)
                    motherInfo: {
                        name: req.body.motherName?.trim(),
                        age: req.body.motherAge ? Number(req.body.motherAge) : undefined,
                        occupation: req.body.motherOccupation?.trim()
                    },
                    //father's information (shared across all patients)
                    fatherInfo: {
                        name: req.body.fatherName?.trim(),
                        age: req.body.fatherAge ? Number(req.body.fatherAge) : undefined,
                        occupation: req.body.fatherOccupation?.trim()
                    },
                    contactNumber: req.body.contactNumber,
                    address: req.body.address,
                    //add patient number for multiple patients
                    patientNumber: i + 1,
                    totalPatients: patientsToProcess.length
                };

                //remove undefined values from nested objects
                if (!appointmentData.motherInfo.name && !appointmentData.motherInfo.age && !appointmentData.motherInfo.occupation) {
                    delete appointmentData.motherInfo;
                }
                if (!appointmentData.fatherInfo.name && !appointmentData.fatherInfo.age && !appointmentData.fatherInfo.occupation) {
                    delete appointmentData.fatherInfo;
                }

                try {
                    const appointment = new Appointment(appointmentData);
                    await appointment.save();
                    createdAppointments.push(appointment);

                    //only create notifications for the first patient to avoid duplicates
                    if (i === 0 && createNotifications) {
                        try {
                            const existingNotification = await Notification.findOne({
                                sourceId: appointmentData.patientId,
                                entityId: appointment._id,
                                type: 'AppointmentCreated',
                                entityType: 'Appointment',
                            });
                            
                            if (!existingNotification) {
                                const patient = await OnlinePatient.findById(appointmentData.patientId);
                                const patientCountMsg = patientsToProcess.length > 1 ? ` for ${patientsToProcess.length} patients` : '';
                                const message = `New appointment request from ${patient?.fullName || 'a patient'}${patientCountMsg} for ${new Date(req.body.preferredDate).toLocaleDateString()} at ${preferredTime}.`;
                                
                                const notification = new Notification({
                                    sourceId: appointmentData.patientId,
                                    sourceType: 'Patient',
                                    type: 'AppointmentCreated',
                                    entityId: appointment._id,
                                    entityType: 'Appointment',
                                    message,
                                    isRead: false
                                });
                                
                                await notification.save();
                            }
                        } catch (error) {
                            console.error('Failed to create notification:', error);
                        }
                    }
                } catch (err) {
                    console.error('Error saving appointment:', err);
                    return res.status(500).json({
                        success: false,
                        message: `Failed to create appointment for patient ${i + 1}`,
                        error: err.message
                    });
                }
            }

            return res.status(201).json({
                success: true,
                message: createNotifications ? 
                    `Appointment request submitted successfully for ${createdAppointments.length} patient(s)` : 
                    `Appointment(s) created successfully for ${createdAppointments.length} patient(s)`,
                data: createdAppointments,
                appointmentCount: createdAppointments.length
            });

        } catch (error) {
            console.error('Error creating appointment:', error);
            next(error);
        }
    }

    
    async getAppointment(req, res, next) {
        try {
            const { patientId, status, fromDate, toDate } = req.query;
            
            //build filter object
            const filter = {};
            
            if (patientId) filter.patientId = patientId;
            if (status) filter.status = status;
            
            //date range filter
            if (fromDate || toDate) {
                filter.preferredDate = {};
                if (fromDate) filter.preferredDate.$gte = new Date(fromDate);
                if (toDate) filter.preferredDate.$lte = new Date(toDate);
            }
            
            const appointments = await Appointment.find(filter)
                // .sort({ preferredDate: 1, preferredTime: 1 })
                .sort({ createdAt: -1 })
                .populate('patientId', 'firstName lastName middleName emailOrContactNumber patientNumber');
            
            return res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
        } catch (error) {
            next(error);
        }
    }

    async getAppointmentDetails(req, res, next) {
        try {
            const { appointmentId } = req.params;
            
            if (!appointmentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Appointment ID is required'
                });
            }
            
            //find the appointment by ID and populate patient information
            const appointment = await Appointment.findById(appointmentId)
                .populate('patientId', 'firstName lastName middleName email contactNumber birthdate sex address dateRegistered');
            
            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Error fetching appointment details:', error);
            next(error);
        }
    }
   
    async getAllTimePerDate(req, res, next) {
        try {
            const { date } = req.query;
            
            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'Date parameter is required'
                });
            }
            
            // parse the date and create date range for the entire day
            const selectedDate = new Date(date);
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);
            
            //build filter for the specific date
            const filter = {
                preferredDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            };
            
            //find all appointments for the specified date
            const appointments = await Appointment.find(filter)
                .sort({ preferredTime: 1 })
                .populate('patientId', 'firstName lastName middleName emailOrContactNumber patientNumber');
            
            //group appointments by time slots
            const timeSlots = appointments.reduce((acc, appointment) => {
                const timeKey = appointment.preferredTime;
                if (!acc[timeKey]) {
                    acc[timeKey] = [];
                }
                acc[timeKey].push(appointment);
                return acc;
            }, {});
            
            //get unique time slots and sort them
            const availableTimeSlots = Object.keys(timeSlots).sort();
            
            return res.status(200).json({
                success: true,
                date: selectedDate.toISOString().split('T')[0],
                totalAppointments: appointments.length,
                availableTimeSlots,
                timeSlots,
                appointments
            });
            
        } catch (error) {
            console.error('Error in getAllTimePerDate:', error);
            next(error);
        }
    }


    async getAppointmentById(req, res, next) {
        try {
            const { appointmentId } = req.params;
            
            const appointment = await Appointment.findById(appointmentId)
                .populate('patientId', 'firstName lastName middleName emailOrContactNumber');
            
            if (!appointment) {
                throw new ApiError('Appointment not found', 404);
            }
            
            return res.status(200).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            next(error);
        }
    };



    async getMyAppointment(req, res, next) {
        try {
            const userId = req.user.id;
            const { status, fromDate, toDate } = req.query;
            
            //filter object
            const filter = { patientId: userId };
            
            //filters
            if (status) filter.status = status;
            
            //date range filter
            if (fromDate || toDate) {
                filter.preferredDate = {};
                if (fromDate) filter.preferredDate.$gte = new Date(fromDate);
                if (toDate) filter.preferredDate.$lte = new Date(toDate);
            }
            
            const appointments = await Appointment.find(filter)
                // .sort({ preferredDate: 1, preferredTime: 1 })
                .sort({ createdAt: -1 })
                .populate('patientId', 'firstName emailOrContactNumber patientNumber');
            
            return res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
        } catch (error) {
            next(error);
        }
    }
   

    async deleteAppointment(req, res, next) {
        try {
            const { appointmentId } = req.params;
            
            const appointment = await Appointment.findByIdAndDelete(appointmentId);
            
            if (!appointment) {
                throw new ApiError('Appointment not found', 404);
            }
            
            return res.status(200).json({
                success: true,
                message: 'Appointment deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    };


    async updateAppointment(req, res, next) {
        try {
            const { appointmentId } = req.params;
            const { path } = req.route;
            
            //check if this is a status-only update
            const isStatusUpdate = path.includes('/status');
            
            //get the appointment with populated patient data
            const appointment = await Appointment.findById(appointmentId).populate('patientId');
            if (!appointment) {
                throw new ApiError('Appointment not found', 404);
            }

            //store the old status for comparison
            const oldStatus = appointment.status;
            
            //update based on request type
            if (isStatusUpdate) {
                //for status-only update
                appointment.status = req.body.status;
            } else {
                //for full update - basic appointment fields
                appointment.patientId = req.body.patientId || appointment.patientId;
                appointment.firstName = req.body.firstName || appointment.firstName;
                appointment.lastName = req.body.lastName || appointment.lastName;
                appointment.middleName = req.body.middleName || appointment.middleName;
                appointment.preferredDate = req.body.preferredDate || appointment.preferredDate;
                appointment.preferredTime = req.body.preferredTime || appointment.preferredTime;
                appointment.reasonForVisit = req.body.reasonForVisit || appointment.reasonForVisit;
                appointment.status = req.body.status || appointment.status;

                //update patient information fields if provided
                if (req.body.birthdate) appointment.birthdate = req.body.birthdate;
                if (req.body.sex) appointment.sex = req.body.sex;
                if (req.body.height !== undefined) appointment.height = req.body.height ? Number(req.body.height) : undefined;
                if (req.body.weight !== undefined) appointment.weight = req.body.weight ? Number(req.body.weight) : undefined;
                if (req.body.religion !== undefined) appointment.religion = req.body.religion?.trim();

                //handle mother's information - check both nested object and flat fields
                const motherName = req.body.motherInfo?.name || req.body.motherName;
                const motherAge = req.body.motherInfo?.age || req.body.motherAge;
                const motherOccupation = req.body.motherInfo?.occupation || req.body.motherOccupation;

                if (motherName !== undefined || motherAge !== undefined || motherOccupation !== undefined) {
                    if (!appointment.motherInfo) appointment.motherInfo = {};
                    if (motherName !== undefined) appointment.motherInfo.name = motherName?.trim();
                    if (motherAge !== undefined) appointment.motherInfo.age = motherAge ? Number(motherAge) : undefined;
                    if (motherOccupation !== undefined) appointment.motherInfo.occupation = motherOccupation?.trim();
                }

                //handle father's information - check both nested object and flat fields
                const fatherName = req.body.fatherInfo?.name || req.body.fatherName;
                const fatherAge = req.body.fatherInfo?.age || req.body.fatherAge;
                const fatherOccupation = req.body.fatherInfo?.occupation || req.body.fatherOccupation;

                if (fatherName !== undefined || fatherAge !== undefined || fatherOccupation !== undefined) {
                    if (!appointment.fatherInfo) appointment.fatherInfo = {};
                    if (fatherName !== undefined) appointment.fatherInfo.name = fatherName?.trim();
                    if (fatherAge !== undefined) appointment.fatherInfo.age = fatherAge ? Number(fatherAge) : undefined;
                    if (fatherOccupation !== undefined) appointment.fatherInfo.occupation = fatherOccupation?.trim();
                }

                //mark nested objects as modified to ensure they're saved
                if (appointment.motherInfo) {
                    appointment.markModified('motherInfo');
                }
                if (appointment.fatherInfo) {
                    appointment.markModified('fatherInfo');
                }

                if (req.body.contactNumber) appointment.contactNumber = req.body.contactNumber;
                if (req.body.address) appointment.address = req.body.address;
            }
            
            await appointment.save();

            let smsResult = null;

            //dend SMS notification if status changed
            if (oldStatus !== appointment.status) {
                //get contact number from either appointment or populated patient
                const contactNumber = appointment.contactNumber || appointment.patientId?.contactNumber;
                
                if (contactNumber) {
                    //only send SMS in production or when SMS_ENABLED is true
                    const shouldSendSMS = process.env.NODE_ENV === 'production' || process.env.SMS_ENABLED === 'true';
                    
                    if (shouldSendSMS) {
                        smsResult = await sendStatusUpdateSMS(appointment, contactNumber);
                    } else {
                        console.log('SMS sending disabled in development environment');
                    }
                } else {
                    console.log('No contact number available for SMS notification');
                }
            }
            
            //include SMS status in response for better debugging
            const response = {
                success: true,
                message: 'Appointment updated successfully',
                data: appointment
            };

            if (smsResult) {
                response.smsStatus = smsResult;
            }

            return res.status(200).json(response);
            
        } catch (error) {
            next(error);
        }
    }
}

async function sendStatusUpdateSMS(appointment, contactNumber) {
    try {
        //convert contact number to string if it's a number
        const contactNumberStr = String(contactNumber);
        
        //convert Philippine mobile number format for Twilio
        let twilioNumber = contactNumberStr;
        if (contactNumberStr.startsWith('09')) {
            twilioNumber = '+63' + contactNumberStr.substring(1);
        } else if (!contactNumberStr.startsWith('+63')) {
            twilioNumber = '+63' + contactNumberStr;
        }

        //determine which template to use based on status
        let templatePath;
        switch (appointment.status.toLowerCase()) {
            case 'scheduled':
                templatePath = 'scheduledMessage.txt';
                break;
            case 'completed':
                templatePath = 'completedMessage.txt';
                break;
            case 'cancelled':
                templatePath = 'cancelledMessage.txt';
                break;
            case 'rebooked':
                templatePath = 'rebookedMessage.txt';
                break;
            default:
                //for other statuses, use a generic template or skip SMS
                console.log(`No SMS template found for status: ${appointment.status}`);
                return {
                    success: false,
                    reason: 'no_template',
                    message: `No SMS template found for status: ${appointment.status}`
                };
        }

        //get patient name - either from populated patient or appointment fields
        const patientName = appointment.patientId?.firstName 
            ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
            : `${appointment.firstName} ${appointment.lastName}`;

        //prepare replacement data for the SMS template
        const replacements = {
            patientName: patientName,
            appointmentNumber: appointment.appointmentNumber,
            preferredDate: new Date(appointment.preferredDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            preferredTime: appointment.preferredTime,
            reasonForVisit: appointment.reasonForVisit,
            status: appointment.status
        };

        //send the SMS
        const result = await sendSMS(twilioNumber, templatePath, replacements);
        
        if (result.success) {
            if (result.reason === 'development_skip') {
                console.log(`SMS notification skipped for ${contactNumberStr} (development mode) - appointment ${appointment.appointmentNumber} status update: ${appointment.status}`);
            } else {
                console.log(`SMS notification sent to ${contactNumberStr} for appointment ${appointment.appointmentNumber} status update: ${appointment.status}`);
            }
        } else {
            console.log(`SMS notification failed for ${contactNumberStr}: ${result.message}`);
        }

        return result;

    } catch (error) {
        console.error('Error in sendStatusUpdateSMS:', error);
        return {
            success: false,
            reason: 'unexpected_error',
            message: error.message
        };
    }
}

module.exports = new AppointmentController();