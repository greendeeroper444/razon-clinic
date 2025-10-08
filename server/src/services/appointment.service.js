const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');
const sendSMS = require('../utils/smsSender');

class AppointmentService {

    async createAppointment(appointmentData, createNotifications = true) {
        if (!appointmentData.reasonForVisit || appointmentData.reasonForVisit.trim().length < 5 || 
            appointmentData.reasonForVisit.trim().length > 200) {
            throw new Error('Reason for visit must be between 5 and 200 characters');
        }

        const { patients = [], ...appointmentInfo } = appointmentData;
        
        //if no patients array, create one with the primary patient data
        const patientsToProcess = patients.length > 0 ? patients : [{
            firstName: appointmentData.firstName,
            lastName: appointmentData.lastName,
            middleName: appointmentData.middleName,
            birthdate: appointmentData.birthdate,
            sex: appointmentData.sex,
            height: appointmentData.height,
            weight: appointmentData.weight
        }];

        if (patientsToProcess.length === 0) {
            throw new Error('At least one patient is required');
        }

        for (let i = 0; i < patientsToProcess.length; i++) {
            const patient = patientsToProcess[i];
            
            if (!patient.birthdate) {
                throw new Error(`Birth date is required for patient ${i + 1}`);
            }

            if (!patient.sex || !['Male', 'Female'].includes(patient.sex)) {
                throw new Error(`Valid sex selection is required for patient ${i + 1}`);
            }
        }

        await this.validateTimeSlot(appointmentData.preferredTime, appointmentData.preferredDate);

        const createdAppointments = [];
        
        for (let i = 0; i < patientsToProcess.length; i++) {
            const patient = patientsToProcess[i];
            
            const appointmentPayload = {
                userId: appointmentData.userId,
                firstName: patient.firstName,
                lastName: patient.lastName,
                middleName: patient.middleName || null,
                preferredDate: appointmentData.preferredDate,
                preferredTime: appointmentData.preferredTime,
                reasonForVisit: appointmentData.reasonForVisit?.trim(),
                status: 'Pending',
                //patient information fields
                birthdate: patient.birthdate,
                sex: patient.sex,
                height: patient.height ? Number(patient.height) : undefined,
                weight: patient.weight ? Number(patient.weight) : undefined,
                religion: appointmentData.religion?.trim(),
                //mother's information (shared across all patients)
                motherInfo: {
                    name: appointmentData.motherName?.trim(),
                    age: appointmentData.motherAge ? Number(appointmentData.motherAge) : undefined,
                    occupation: appointmentData.motherOccupation?.trim()
                },
                //father's information (shared across all patients)
                fatherInfo: {
                    name: appointmentData.fatherName?.trim(),
                    age: appointmentData.fatherAge ? Number(appointmentData.fatherAge) : undefined,
                    occupation: appointmentData.fatherOccupation?.trim()
                },
                contactNumber: appointmentData.contactNumber,
                address: appointmentData.address,
                //add patient number for multiple patients
                patientNumber: i + 1,
                totalPatients: patientsToProcess.length
            };

            //remove undefined values from nested objects
            if (!appointmentPayload.motherInfo.name && !appointmentPayload.motherInfo.age && !appointmentPayload.motherInfo.occupation) {
                delete appointmentPayload.motherInfo;
            }
            if (!appointmentPayload.fatherInfo.name && !appointmentPayload.fatherInfo.age && !appointmentPayload.fatherInfo.occupation) {
                delete appointmentPayload.fatherInfo;
            }

            const appointment = new Appointment(appointmentPayload);
            await appointment.save();
            createdAppointments.push(appointment);

            //only create notifications for the first patient to avoid duplicates
            if (i === 0 && createNotifications) {
                await this.createAppointmentNotification(appointmentPayload.userId, appointment, patientsToProcess.length, appointmentData.preferredDate, appointmentData.preferredTime);
            }
        }

        return createdAppointments;
    }

    async validateTimeSlot(preferredTime, preferredDate) {
        // vlidate time format: must be in HH:MM format, and MM should be 00, 15, 30, or 45
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):(00|15|30|45)$/;
        if (!timeRegex.test(preferredTime)) {
            throw new Error('Invalid time format. Time must be in HH:MM format using 15-minute intervals (e.g., 08:00, 08:15, 08:30, 08:45).');
        }

        // validate business hours (between 08:00 and 17:00)
        const [hourStr, minuteStr] = preferredTime.split(':');
        const hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);

        if (hour < 8 || (hour === 17 && minute > 0) || hour > 17) {
            throw new Error('Appointments are only available between 08:00 and 17:00.');
        }

        //check for appointment conflicts on the same date and time
        const selectedDate = new Date(preferredDate);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
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
            throw new Error(`This time slot (${preferredTime} on ${preferredDate}) is already booked. Please choose a different time.`);
        }
    }

    async createAppointmentNotification(userId, appointment, patientCount, preferredDate, preferredTime) {
        try {
            const existingNotification = await Notification.findOne({
                sourceId: userId,
                entityId: appointment._id,
                type: 'AppointmentCreated',
                entityType: 'Appointment',
            });
            
            if (!existingNotification) {
                const patient = await User.findById(userId);
                const patientCountMsg = patientCount > 1 ? ` for ${patientCount} patients` : '';
                const message = `New appointment request from ${patient?.fullName || 'a patient'}${patientCountMsg} for ${new Date(preferredDate).toLocaleDateString()} at ${preferredTime}.`;
                
                const notification = new Notification({
                    sourceId: userId,
                    sourceType: 'User',
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

    async getAppointments(queryParams) {
        try {
            const {
                search,
                page,
                limit,
                userId,
                status,
                fromDate,
                toDate,
                firstName,
                lastName,
                reasonForVisit,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = queryParams;

            const filter = {};
            
            if (userId) filter.userId = userId;
            if (status) filter.status = status;

            if (fromDate || toDate) {
                filter.preferredDate = {};
                if (fromDate) filter.preferredDate.$gte = new Date(fromDate);
                if (toDate) filter.preferredDate.$lte = new Date(toDate);
            }

            //search functionality - search across multiple fields
            if (search) {
                const searchConditions = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { reasonForVisit: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } }
                ];

                //handle numeric search for contactNumber
                const numericSearch = parseInt(search);
                if (!isNaN(numericSearch)) {
                    //if search is numeric, search for exact match or numbers that start with the search term
                    searchConditions.push({ contactNumber: numericSearch });
                    
                    //also search for numbers that start with the search term (convert to string comparison)
                    const searchStr = search.toString();
                    searchConditions.push({
                        $expr: {
                            $regexMatch: {
                                input: { $toString: "$contactNumber" },
                                regex: `^${searchStr}`,
                                options: "i"
                            }
                        }
                    });
                }

                filter.$or = searchConditions;
            }

            if (firstName) {
                filter.firstName = { $regex: firstName, $options: 'i' };
            }
            if (lastName) {
                filter.lastName = { $regex: lastName, $options: 'i' };
            }
            if (reasonForVisit) {
                filter.reasonForVisit = { $regex: reasonForVisit, $options: 'i' };
            }

            const sort = {};
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const totalItems = await Appointment.countDocuments(filter);

            const searchTerm = search || firstName || lastName || reasonForVisit || null;

            let appointments;
            let pagination;

            if (limit && parseInt(limit) > 0) {
                const currentPage = parseInt(page) || 1;
                const itemsPerPage = parseInt(limit);
                const skip = (currentPage - 1) * itemsPerPage;
                const totalPages = Math.ceil(totalItems / itemsPerPage);
                
                appointments = await Appointment.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(itemsPerPage)
                    .populate('userId', 'firstName lastName middleName emailOrContactNumber patientNumber');

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
                appointments = await Appointment.find(filter)
                    .sort(sort)
                    .populate('userId', 'firstName lastName middleName emailOrContactNumber patientNumber');

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
                appointments,
                pagination,
                // count: appointments.length
            };
        } catch (error) {
            throw error;
        }
    }

    async getAppointmentById(appointmentId) {
        if (!appointmentId) {
            throw new Error('Appointment ID is required');
        }

        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new Error('Invalid appointment ID format');
        }

        const appointment = await Appointment.findById(appointmentId)
            .populate('userId', 'firstName lastName middleName email contactNumber birthdate sex address dateRegistered');
        
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        
        return appointment;
    }

    async getTimeSlotsByDate(date) {
        if (!date) {
            throw new Error('Date parameter is required');
        }
        
        //parse the date and create date range for the entire day
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const filter = {
            preferredDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        };
        
        const appointments = await Appointment.find(filter)
            .sort({ preferredTime: 1 })
            .populate('userId', 'firstName lastName middleName emailOrContactNumber patientNumber');
        
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
        
        return {
            date: selectedDate.toISOString().split('T')[0],
            totalAppointments: appointments.length,
            availableTimeSlots,
            timeSlots,
            appointments
        };
    }

    async getUserAppointments(userId, queryParams) {
        const { status, fromDate, toDate } = queryParams;
       
        const filter = { userId };
        
        if (status) filter.status = status;
        
        if (fromDate || toDate) {
            filter.preferredDate = {};
            if (fromDate) filter.preferredDate.$gte = new Date(fromDate);
            if (toDate) filter.preferredDate.$lte = new Date(toDate);
        }
        
        const appointments = await Appointment.find(filter)
            .sort({ createdAt: -1 })
            .populate('userId', 'firstName emailOrContactNumber patientNumber');
        
        return {
            appointments,
            count: appointments.length
        };
    }

    async deleteAppointment(appointmentId) {
        if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new Error('Invalid appointment ID');
        }

        const appointment = await Appointment.findByIdAndDelete(appointmentId);
        
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        
        return appointment;
    }

    async updateAppointment(appointmentId, updateData, isStatusUpdate = false) {
        if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
            throw new Error('Invalid appointment ID');
        }

        const appointment = await Appointment.findById(appointmentId).populate('userId');
        if (!appointment) {
            throw new Error('Appointment not found');
        }

        //store the old status for comparison
        const oldStatus = appointment.status;
        
        //update based on request type
        if (isStatusUpdate) {
            //for status-only update
            appointment.status = updateData.status;
        } else {
            //for full update - basic appointment fields
            if (updateData.userId) appointment.userId = updateData.userId;
            if (updateData.firstName) appointment.firstName = updateData.firstName;
            if (updateData.lastName) appointment.lastName = updateData.lastName;
            if (updateData.middleName !== undefined) appointment.middleName = updateData.middleName;
            if (updateData.preferredDate) appointment.preferredDate = updateData.preferredDate;
            if (updateData.preferredTime) appointment.preferredTime = updateData.preferredTime;
            if (updateData.reasonForVisit) appointment.reasonForVisit = updateData.reasonForVisit;
            if (updateData.status) appointment.status = updateData.status;

            //update patient information fields if provided
            if (updateData.birthdate) appointment.birthdate = updateData.birthdate;
            if (updateData.sex) appointment.sex = updateData.sex;
            if (updateData.height !== undefined) appointment.height = updateData.height ? Number(updateData.height) : undefined;
            if (updateData.weight !== undefined) appointment.weight = updateData.weight ? Number(updateData.weight) : undefined;
            if (updateData.religion !== undefined) appointment.religion = updateData.religion?.trim();

            //handle mother's information
            const motherName = updateData.motherInfo?.name || updateData.motherName;
            const motherAge = updateData.motherInfo?.age || updateData.motherAge;
            const motherOccupation = updateData.motherInfo?.occupation || updateData.motherOccupation;

            if (motherName !== undefined || motherAge !== undefined || motherOccupation !== undefined) {
                if (!appointment.motherInfo) appointment.motherInfo = {};
                if (motherName !== undefined) appointment.motherInfo.name = motherName?.trim();
                if (motherAge !== undefined) appointment.motherInfo.age = motherAge ? Number(motherAge) : undefined;
                if (motherOccupation !== undefined) appointment.motherInfo.occupation = motherOccupation?.trim();
                appointment.markModified('motherInfo');
            }

            //handle father's information
            const fatherName = updateData.fatherInfo?.name || updateData.fatherName;
            const fatherAge = updateData.fatherInfo?.age || updateData.fatherAge;
            const fatherOccupation = updateData.fatherInfo?.occupation || updateData.fatherOccupation;

            if (fatherName !== undefined || fatherAge !== undefined || fatherOccupation !== undefined) {
                if (!appointment.fatherInfo) appointment.fatherInfo = {};
                if (fatherName !== undefined) appointment.fatherInfo.name = fatherName?.trim();
                if (fatherAge !== undefined) appointment.fatherInfo.age = fatherAge ? Number(fatherAge) : undefined;
                if (fatherOccupation !== undefined) appointment.fatherInfo.occupation = fatherOccupation?.trim();
                appointment.markModified('fatherInfo');
            }

            if (updateData.contactNumber) appointment.contactNumber = updateData.contactNumber;
            if (updateData.address) appointment.address = updateData.address;
        }
        
        await appointment.save();

        // //send SMS notification if status changed
        // let smsResult = null;
        // if (oldStatus !== appointment.status) {
        //     smsResult = await this.sendStatusUpdateSMS(appointment);
        // }

        return { 
            appointment, 
            // smsResult 
        };
    }

    // async sendStatusUpdateSMS(appointment) {
    //     try {
    //         //get contact number from either appointment or populated patient
    //         const contactNumber = appointment.contactNumber || appointment.userId?.contactNumber;
            
    //         if (!contactNumber) {
    //             console.log('No contact number available for SMS notification');
    //             return null;
    //         }

    //         //only send SMS in production or when SMS_ENABLED is true
    //         const shouldSendSMS = process.env.NODE_ENV === 'production' || process.env.SMS_ENABLED === 'true';
            
    //         if (!shouldSendSMS) {
    //             console.log('SMS sending disabled in development environment');
    //             return null;
    //         }

    //         const contactNumberStr = String(contactNumber);
            
    //         //convert Philippine mobile number format for Twilio
    //         let twilioNumber = contactNumberStr;
    //         if (contactNumberStr.startsWith('09')) {
    //             twilioNumber = '+63' + contactNumberStr.substring(1);
    //         } else if (!contactNumberStr.startsWith('+63')) {
    //             twilioNumber = '+63' + contactNumberStr;
    //         }

    //         //fetermine which template to use based on status
    //         let templatePath;
    //         switch (appointment.status.toLowerCase()) {
    //             case 'scheduled':
    //                 templatePath = 'scheduledMessage.txt';
    //                 break;
    //             case 'completed':
    //                 templatePath = 'completedMessage.txt';
    //                 break;
    //             case 'cancelled':
    //                 templatePath = 'cancelledMessage.txt';
    //                 break;
    //             case 'rebooked':
    //                 templatePath = 'rebookedMessage.txt';
    //                 break;
    //             default:
    //                 console.log(`No SMS template found for status: ${appointment.status}`);
    //                 return {
    //                     success: false,
    //                     reason: 'no_template',
    //                     message: `No SMS template found for status: ${appointment.status}`
    //                 };
    //         }

    //         //get patient name
    //         const patientName = appointment.userId?.firstName 
    //             ? `${appointment.userId.firstName} ${appointment.userId.lastName}`
    //             : `${appointment.firstName} ${appointment.lastName}`;

    //         //prepare replacement data for the SMS template
    //         const replacements = {
    //             patientName: patientName,
    //             appointmentNumber: appointment.appointmentNumber,
    //             preferredDate: new Date(appointment.preferredDate).toLocaleDateString('en-US', {
    //                 year: 'numeric',
    //                 month: 'long',
    //                 day: 'numeric'
    //             }),
    //             preferredTime: appointment.preferredTime,
    //             reasonForVisit: appointment.reasonForVisit,
    //             status: appointment.status
    //         };

    //         //dend the SMS
    //         const result = await sendSMS(twilioNumber, templatePath, replacements);
            
    //         if (result.success) {
    //             if (result.reason === 'development_skip') {
    //                 console.log(`SMS notification skipped for ${contactNumberStr} (development mode) - appointment ${appointment.appointmentNumber} status update: ${appointment.status}`);
    //             } else {
    //                 console.log(`SMS notification sent to ${contactNumberStr} for appointment ${appointment.appointmentNumber} status update: ${appointment.status}`);
    //             }
    //         } else {
    //             console.log(`SMS notification failed for ${contactNumberStr}: ${result.message}`);
    //         }

    //         return result;

    //     } catch (error) {
    //         console.error('Error in sendStatusUpdateSMS:', error);
    //         return {
    //             success: false,
    //             reason: 'unexpected_error',
    //             message: error.message
    //         };
    //     }
    // }

    async checkAppointmentExists(appointmentId) {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return false;
        }
        
        const appointment = await Appointment.findById(appointmentId);
        return !!appointment;
    }

    async countAppointments(filter = {}) {
        return await Appointment.countDocuments(filter);
    }
}

module.exports = new AppointmentService();