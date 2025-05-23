const Admin = require('../../models/admin.model');
const OnlinePatient = require('../../models/onlinePatient.model');
const Notification = require('../../models/notification.model');
const Appointment = require('../../models/appointment.model');
const { ApiError } = require('../../utils/errors');
const sendSMS = require('../../utils/smsSender');

class AppointmentController {
    
    // async addAppointment(req, res, next) {
    //     try {
    //         const appointmentData = {
    //             patientId: req.body.patientId,
    //             preferredDate: req.body.preferredDate,
    //             preferredTime: req.body.preferredTime,
    //             reasonForVisit: req.body.reasonForVisit,
    //             status: req.body.status || 'Scheduled'
    //         };

    //         const appointment = new Appointment(appointmentData);
    //         await appointment.save();

    //         return res.status(201).json({
    //             success: true,
    //             message: 'Appointment created successfully',
    //             data: appointment
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // };
;

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
            
            const appointmentData = {
                patientId: req.body.patientId,
                preferredDate: req.body.preferredDate,
                preferredTime: req.body.preferredTime,
                reasonForVisit: req.body.reasonForVisit?.trim(),
                status: 'Pending'
            };

            try {
                const appointment = new Appointment(appointmentData);
                await appointment.save();

                //only create notifications if the request is from a patient
                if (createNotifications) {
                    try {
                        const existingNotification = await Notification.findOne({
                            sourceId: appointmentData.patientId,
                            entityId: appointment._id,
                            type: 'AppointmentCreated',
                            entityType: 'Appointment',
                        });
                        
                        if (!existingNotification) {
                            const patient = await OnlinePatient.findById(appointmentData.patientId);
                            const message = `New appointment request from ${patient?.fullName || 'a patient'} for ${new Date(req.body.preferredDate).toLocaleDateString()} at ${req.body.preferredTime}.`;
                            
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

                return res.status(201).json({
                    success: true,
                    message: createNotifications ? 
                        'Appointment request submitted successfully' : 
                        'Appointment created successfully',
                    data: appointment
                });
            } catch (err) {
                console.error('Error saving appointment:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create appointment',
                    error: err.message
                });
            }
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
                .sort({ preferredDate: 1, preferredTime: 1 })
                .populate('patientId', 'fullName emailOrContactNumber');
            
            return res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
        } catch (error) {
            next(error);
        }
    };



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
                .populate('patientId', 'fullName email contactNumber birthdate sex address dateRegistered');
            
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
   

    async getAppointmentById(req, res, next) {
        try {
            const { appointmentId } = req.params;
            
            const appointment = await Appointment.findById(appointmentId)
                .populate('patientId', 'fullName emailOrContactNumber');
            
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
                .sort({ preferredDate: 1, preferredTime: 1 })
                .populate('patientId', 'fullName emailOrContactNumber');
            
            return res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
        } catch (error) {
            next(error);
        }
    }
    
   
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
                //for full update
                appointment.patientId = req.body.patientId || appointment.patientId;
                appointment.preferredDate = req.body.preferredDate || appointment.preferredDate;
                appointment.preferredTime = req.body.preferredTime || appointment.preferredTime;
                appointment.reasonForVisit = req.body.reasonForVisit || appointment.reasonForVisit;
                appointment.status = req.body.status || appointment.status;
            }
            
            await appointment.save();

            let smsResult = null;

            //send SMS notification if status changed and patient has contact number
            if (oldStatus !== appointment.status && appointment.patientId.contactNumber) {
                //only send SMS in production or when SMS_ENABLED is true
                const shouldSendSMS = process.env.NODE_ENV === 'production' || process.env.SMS_ENABLED === 'true';
                
                if (shouldSendSMS) {
                    smsResult = await sendStatusUpdateSMS(appointment);
                } else {
                    console.log('SMS sending disabled in development environment');
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
}


async function sendStatusUpdateSMS(appointment) {
    try {
        const patient = appointment.patientId;
        const contactNumber = patient.contactNumber;
        
        //convert Philippine mobile number format for Twilio
        let twilioNumber = contactNumber;
        if (contactNumber.startsWith('09')) {
            twilioNumber = '+63' + contactNumber.substring(1);
        } else if (!contactNumber.startsWith('+63')) {
            twilioNumber = '+63' + contactNumber;
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

        //prepare replacement data for the SMS template
        const replacements = {
            patientName: patient.fullName,
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
                console.log(`SMS notification skipped for ${contactNumber} (development mode) - appointment ${appointment.appointmentNumber} status update: ${appointment.status}`);
            } else {
                console.log(`SMS notification sent to ${contactNumber} for appointment ${appointment.appointmentNumber} status update: ${appointment.status}`);
            }
        } else {
            console.log(`SMS notification failed for ${contactNumber}: ${result.message}`);
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