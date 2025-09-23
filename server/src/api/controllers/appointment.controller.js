const AppointmentService = require('../../services/appointment.service');

class AppointmentController {

    async addAppointment(req, res, next) {
        try {
            const createNotifications = !req.user || req.user.role === 'User';
            const appointments = await AppointmentService.createAppointment(req.body, createNotifications);

            return res.status(201).json({
                success: true,
                message: createNotifications ? 
                    `Appointment request submitted successfully for ${appointments.length} patient(s)` : 
                    `Appointment(s) created successfully for ${appointments.length} patient(s)`,
                data: {
                    appointments,
                    appointmentCount: appointments.length
                }
            });
        } catch (error) {
            if (error.message.includes('Reason for visit must be between') ||
                error.message.includes('At least one patient is required') ||
                error.message.includes('Birth date is required') ||
                error.message.includes('Valid sex selection is required') ||
                error.message.includes('Invalid time format') ||
                error.message.includes('Appointments are only available between')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message.includes('This time slot') && error.message.includes('is already booked')) {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    // async getAppointments(req, res, next) {
    //     try {
    //         const result = await AppointmentService.getAppointments(req.query);

    //         return res.status(200).json({
    //             success: true,
    //             message: 'Appointments retrieved successfully',
    //             data: result
    //         });
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    async getAppointments(req, res, next) {
        try {
            const isMyAppointmentsRoute = req.route.path === '/getMyAppointments';
            let queryParams = { ...req.query };
            
            //if it's getMyAppointments route, enforce userId filter
            if (isMyAppointmentsRoute) {
                const userId = req.user.id;
                if (!userId) {
                    return res.status(400).json({
                        success: false,
                        message: 'User ID is required for getMyAppointments route'
                    });
                }
                queryParams.userId = userId;
            }
            const result = await AppointmentService.getAppointments(queryParams);
            
            const message = isMyAppointmentsRoute ? 'My appointments retrieved successfully' : 'Appointments retrieved successfully';
            
            return res.status(200).json({
                success: true,
                message: message,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getAppointmentById(req, res, next) {
        try {
            const { appointmentId } = req.params;
            const appointment = await AppointmentService.getAppointmentById(appointmentId);

            return res.status(200).json({
                success: true,
                message: 'Appointment retrieved successfully',
                data: appointment
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllTimePerDate(req, res, next) {
        try {
            const { date } = req.query;
            const result = await AppointmentService.getTimeSlotsByDate(date);

            return res.status(200).json({
                success: true,
                message: 'Time slots retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyAppointment(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await AppointmentService.getUserAppointments(userId, req.query);

            return res.status(200).json({
                success: true,
                message: 'User appointments retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteAppointment(req, res, next) {
        try {
            const { appointmentId } = req.params;
            const appointment = await AppointmentService.deleteAppointment(appointmentId);

            return res.status(200).json({
                success: true,
                message: 'Appointment deleted successfully',
                data: appointment
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
            
            const result = await AppointmentService.updateAppointment(appointmentId, req.body, isStatusUpdate);

            //include SMS status in response for better debugging
            const response = {
                success: true,
                message: 'Appointment updated successfully',
                data: result.appointment
            };

            if (result.smsResult) {
                response.smsStatus = result.smsResult;
            }

            return res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AppointmentController();