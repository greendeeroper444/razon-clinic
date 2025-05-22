const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new mongoose.Schema(
    {
        //who created/triggered the notification
        sourceId: {
            type: Schema.Types.ObjectId,
            required: false,
            refPath: 'sourceType',
        },
        sourceType: {
            type: String,
            enum: ['Patient', 'Doctor', 'Secretary', 'System'],
            default: 'System'
        },
        //type of notification
        type: {
            type: String,
            enum: [
                'AppointmentReminder', 
                'AppointmentCreated',
                'AppointmentUpdated',
                'AppointmentCancelled',
                'PatientCreated',
                'MedicalRecordUpdated',
                'LowStock', 
                'ExpiredItem'
            ],
            required: true
        },
        //reference to the related entity
        entityId: {
            type: Schema.Types.ObjectId,
            required: false
        },
        //type of entity the notification refers to
        entityType: {
            type: String,
            enum: ['Appointment', 'Patient', 'MedicalRecord', 'Inventory'],
            required: false
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;