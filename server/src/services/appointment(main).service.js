const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const mongoose = require('mongoose');
const sendSMS = require('../utils/smsSender');

class AppointmentService {

    async createAppointment(appointmentData, createNotifications = true) {
        await this.checkTimeSlotConflict(appointmentData.preferredTime, appointmentData.preferredDate);
        const appointmentPayload = this.buildAppointmentPayload(appointmentData);

        const appointment = new Appointment(appointmentPayload);
        await appointment.save();

        if (createNotifications) {
            await this.createAppointmentNotification(
                appointmentPayload.userId, 
                appointment, 
                appointmentData.preferredDate, 
                appointmentData.preferredTime
            );
        }

        return appointment;
    }

    buildAppointmentPayload(data) {
        const payload = {
            userId: data.userId,
            firstName: data.firstName,
            lastName: data.lastName,
            middleName: data.middleName || null,
            preferredDate: data.preferredDate,
            preferredTime: data.preferredTime,
            reasonForVisit: data.reasonForVisit?.trim(),
            status: 'Pending',
            birthdate: data.birthdate,
            sex: data.sex,
            height: data.height ? Number(data.height) : undefined,
            weight: data.weight ? Number(data.weight) : undefined,
            religion: data.religion?.trim(),
            contactNumber: data.contactNumber,
            address: data.address
        };

        // Add parent information if provided
        const motherInfo = this.buildParentInfo(data.motherName, data.motherAge, data.motherOccupation);
        const fatherInfo = this.buildParentInfo(data.fatherName, data.fatherAge, data.fatherOccupation);
        
        if (motherInfo) payload.motherInfo = motherInfo;
        if (fatherInfo) payload.fatherInfo = fatherInfo;

        return payload;
    }

    buildParentInfo(name, age, occupation) {
        const info = {
            name: name?.trim(),
            age: age ? Number(age) : undefined,
            occupation: occupation?.trim()
        };

        return (info.name || info.age || info.occupation) ? info : null;
    }

    async checkTimeSlotConflict(preferredTime, preferredDate) {
        const { startOfDay, endOfDay } = this.getDateRange(preferredDate);

        const conflictingAppointment = await Appointment.findOne({
            preferredDate: { $gte: startOfDay, $lte: endOfDay },
            preferredTime: preferredTime,
            status: { $ne: 'Cancelled' }
        });

        if (conflictingAppointment) {
            throw new Error(`This time slot (${preferredTime} on ${preferredDate}) is already booked. Please choose a different time.`);
        }
    }

    getDateRange(date) {
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        return { startOfDay, endOfDay };
    }

    async createAppointmentNotification(userId, appointment, preferredDate, preferredTime) {
        try {
            const existingNotification = await Notification.findOne({
                sourceId: userId,
                entityId: appointment._id,
                type: 'AppointmentCreated',
                entityType: 'Appointment',
            });
            
            if (existingNotification) return;

            const user = await User.findById(userId);
            const userName = user ? `${user.firstName} ${user.lastName}` : 'a user';
            const formattedDate = new Date(preferredDate).toLocaleDateString();
            
            await Notification.create({
                sourceId: userId,
                sourceType: 'User',
                type: 'AppointmentCreated',
                entityId: appointment._id,
                entityType: 'Appointment',
                message: `New appointment request from ${userName} for ${formattedDate} at ${preferredTime}.`,
                isRead: false
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    }

    async getAppointments(queryParams) {
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

        const filter = this.buildAppointmentFilter({
            userId, status, fromDate, toDate, 
            search, firstName, lastName, reasonForVisit
        });

        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const totalItems = await Appointment.countDocuments(filter);
        const searchTerm = search || firstName || lastName || reasonForVisit || null;

        if (limit && parseInt(limit) > 0) {
            return await this.getPaginatedAppointments(filter, sort, page, limit, totalItems, searchTerm);
        }

        const appointments = await this.fetchAppointments(filter, sort);
        return {
            appointments,
            pagination: this.buildUnlimitedPagination(totalItems, searchTerm)
        };
    }

    buildAppointmentFilter({ userId, status, fromDate, toDate, search, firstName, lastName, reasonForVisit }) {
        const filter = {};
        
        if (userId) filter.userId = userId;
        if (status) filter.status = status;

        if (fromDate || toDate) {
            filter.preferredDate = {};
            if (fromDate) filter.preferredDate.$gte = new Date(fromDate);
            if (toDate) filter.preferredDate.$lte = new Date(toDate);
        }

        if (search) {
            filter.$or = this.buildSearchConditions(search);
        }

        if (firstName) filter.firstName = { $regex: firstName, $options: 'i' };
        if (lastName) filter.lastName = { $regex: lastName, $options: 'i' };
        if (reasonForVisit) filter.reasonForVisit = { $regex: reasonForVisit, $options: 'i' };

        return filter;
    }

    buildSearchConditions(search) {
        const conditions = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { reasonForVisit: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } }
        ];

        const numericSearch = parseInt(search);
        if (!isNaN(numericSearch)) {
            conditions.push(
                { contactNumber: numericSearch },
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$contactNumber" },
                            regex: `^${search}`,
                            options: "i"
                        }
                    }
                }
            );
        }

        return conditions;
    }

    async getPaginatedAppointments(filter, sort, page, limit, totalItems, searchTerm) {
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit);
        const skip = (currentPage - 1) * itemsPerPage;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        const appointments = await this.fetchAppointments(filter, sort, skip, itemsPerPage);

        const startIndex = totalItems > 0 ? skip + 1 : 0;
        const endIndex = Math.min(skip + itemsPerPage, totalItems);

        return {
            appointments,
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                hasNextPage: currentPage < totalPages,
                hasPreviousPage: currentPage > 1,
                startIndex,
                endIndex,
                isUnlimited: false,
                nextPage: currentPage < totalPages ? currentPage + 1 : null,
                previousPage: currentPage > 1 ? currentPage - 1 : null,
                remainingItems: Math.max(0, totalItems - endIndex),
                searchTerm
            }
        };
    }

    buildUnlimitedPagination(totalItems, searchTerm) {
        return {
            currentPage: 1,
            totalPages: 1,
            totalItems,
            itemsPerPage: totalItems,
            hasNextPage: false,
            hasPreviousPage: false,
            startIndex: totalItems > 0 ? 1 : 0,
            endIndex: totalItems,
            isUnlimited: true,
            nextPage: null,
            previousPage: null,
            remainingItems: 0,
            searchTerm
        };
    }

    async fetchAppointments(filter, sort, skip = 0, limit = 0) {
        const query = Appointment.find(filter)
            .sort(sort)
            .populate('userId', 'firstName lastName middleName email contactNumber userNumber');

        if (limit > 0) {
            query.skip(skip).limit(limit);
        }

        return await query;
    }

    async getAppointmentById(appointmentId) {
        this.validateObjectId(appointmentId, 'Appointment ID');

        const appointment = await Appointment.findById(appointmentId)
            .populate('userId', 'firstName lastName middleName email contactNumber birthdate sex address dateRegistered userNumber');
        
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        
        return appointment;
    }

    async getTimeSlotsByDate(date) {
        const { startOfDay, endOfDay } = this.getDateRange(date);
        
        const appointments = await Appointment.find({
            preferredDate: { $gte: startOfDay, $lte: endOfDay }
        })
        .sort({ preferredTime: 1 })
        .populate('userId', 'firstName lastName middleName email contactNumber userNumber');
        
        const timeSlots = this.groupAppointmentsByTime(appointments);
        const availableTimeSlots = Object.keys(timeSlots).sort();
        
        return {
            date: new Date(date).toISOString().split('T')[0],
            totalAppointments: appointments.length,
            availableTimeSlots,
            timeSlots,
            appointments
        };
    }

    groupAppointmentsByTime(appointments) {
        return appointments.reduce((acc, appointment) => {
            const timeKey = appointment.preferredTime;
            if (!acc[timeKey]) acc[timeKey] = [];
            acc[timeKey].push(appointment);
            return acc;
        }, {});
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
            .populate('userId', 'firstName lastName middleName email contactNumber userNumber');
        
        return {
            appointments,
            count: appointments.length
        };
    }

    async deleteAppointment(appointmentId) {
        this.validateObjectId(appointmentId, 'Appointment ID');

        const appointment = await Appointment.findByIdAndDelete(appointmentId);
        
        if (!appointment) {
            throw new Error('Appointment not found');
        }
        
        return appointment;
    }

    async updateAppointment(appointmentId, updateData, isStatusUpdate = false) {
        this.validateObjectId(appointmentId, 'Appointment ID');

        const appointment = await Appointment.findById(appointmentId).populate('userId');
        if (!appointment) {
            throw new Error('Appointment not found');
        }

        const oldStatus = appointment.status;
        
        if (isStatusUpdate) {
            appointment.status = updateData.status;
        } else {
            this.applyFullUpdate(appointment, updateData);
        }
        
        await appointment.save();

        //send sms notification if status changed
        let smsResult = null;
        if (oldStatus !== appointment.status) {
            smsResult = await this.sendStatusUpdateSMS(appointment);
        }

        return { appointment, smsResult };
    }

    applyFullUpdate(appointment, updateData) {
        const basicFields = ['userId', 'firstName', 'lastName', 'middleName', 'preferredDate', 
        'preferredTime', 'reasonForVisit', 'status', 'birthdate', 'sex', 
        'contactNumber', 'address'];
        
        basicFields.forEach(field => {
            if (updateData[field] !== undefined) {
                appointment[field] = updateData[field];
            }
        });

        if (updateData.height !== undefined) {
            appointment.height = updateData.height ? Number(updateData.height) : undefined;
        }
        if (updateData.weight !== undefined) {
            appointment.weight = updateData.weight ? Number(updateData.weight) : undefined;
        }
        if (updateData.religion !== undefined) {
            appointment.religion = updateData.religion?.trim();
        }

        this.updateParentInfo(appointment, 'mother', updateData);
        this.updateParentInfo(appointment, 'father', updateData);
    }

    updateParentInfo(appointment, parent, updateData) {
        const infoKey = `${parent}Info`;
        const nameKey = `${parent}Name`;
        const ageKey = `${parent}Age`;
        const occupationKey = `${parent}Occupation`;

        const name = updateData[infoKey]?.name || updateData[nameKey];
        const age = updateData[infoKey]?.age || updateData[ageKey];
        const occupation = updateData[infoKey]?.occupation || updateData[occupationKey];

        if (name !== undefined || age !== undefined || occupation !== undefined) {
            if (!appointment[infoKey]) appointment[infoKey] = {};
            if (name !== undefined) appointment[infoKey].name = name?.trim();
            if (age !== undefined) appointment[infoKey].age = age ? Number(age) : undefined;
            if (occupation !== undefined) appointment[infoKey].occupation = occupation?.trim();
            appointment.markModified(infoKey);
        }
    }

    async sendStatusUpdateSMS(appointment) {
        try {
            const contactNumber = appointment.contactNumber || appointment.userId?.contactNumber;
            
            if (!contactNumber) {
                console.log('No contact number available for SMS notification');
                return null;
            }

            const shouldSendSMS = process.env.NODE_ENV === 'production' || process.env.SMS_ENABLED === 'true';
            
            if (!shouldSendSMS) {
                console.log('SMS sending disabled in development environment');
                return null;
            }

            const twilioNumber = this.formatPhoneNumber(String(contactNumber));
            const templatePath = this.getStatusTemplate(appointment.status);

            if (!templatePath) {
                return {
                    success: false,
                    reason: 'no_template',
                    message: `No SMS template found for status: ${appointment.status}`
                };
            }

            const userName = appointment.userId?.firstName 
                ? `${appointment.userId.firstName} ${appointment.userId.lastName}`
                : `${appointment.firstName} ${appointment.lastName}`;

            const replacements = {
                userName,
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

            const result = await sendSMS(twilioNumber, templatePath, replacements);
            
            if (result.success) {
                const logMsg = result.reason === 'development_skip' 
                    ? 'skipped (development mode)' 
                    : 'sent';
                console.log(`SMS notification ${logMsg} for appointment ${appointment.appointmentNumber} status: ${appointment.status}`);
            } else {
                console.log(`SMS notification failed: ${result.message}`);
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

    formatPhoneNumber(number) {
        if (number.startsWith('09')) {
            return '+63' + number.substring(1);
        }
        if (!number.startsWith('+63')) {
            return '+63' + number;
        }
        return number;
    }

    getStatusTemplate(status) {
        const templates = {
            'scheduled': 'scheduledMessage.txt',
            'completed': 'completedMessage.txt',
            'cancelled': 'cancelledMessage.txt',
            'rebooked': 'rebookedMessage.txt'
        };
        return templates[status.toLowerCase()];
    }

    validateObjectId(id, fieldName = 'ID') {
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid ${fieldName} format`);
        }
    }

    async checkAppointmentExists(appointmentId) {
        if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
            return false;
        }
        return !!(await Appointment.findById(appointmentId));
    }

    async countAppointments(filter = {}) {
        return await Appointment.countDocuments(filter);
    }
}

module.exports = new AppointmentService();