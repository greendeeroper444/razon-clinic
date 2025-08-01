const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        appointmentNumber: {
            type: String,
            unique: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        middleName: {
            type: String,
            required: false
        },
        birthdate: {
            type: Date,
            required: true
        },
        sex: {
            type: String,
            required: true,
            enum: ['Male', 'Female']
        },
        height: {
            type: Number,
            required: false,
            min: 30,
            max: 300
        },
        weight: {
            type: Number,
            required: false,
            min: 1,
            max: 500
        },
        contactNumber: {
            type: Number,
            required: true
        },
        address: {
            type: String,
            required: true,
        },
        religion: {
            type: String,
            required: false,
            maxlength: 30,
            trim: true
        },
        //mother's information
        motherInfo: {
            name: {
                type: String,
                required: false,
                maxlength: 50,
                trim: true
            },
            age: {
                type: Number,
                required: false,
                min: 15,
                max: 120
            },
            occupation: {
                type: String,
                required: false,
                maxlength: 50,
                trim: true
            }
        },
        //father's information
        fatherInfo: {
            name: {
                type: String,
                required: false,
                maxlength: 50,
                trim: true
            },
            age: {
                type: Number,
                required: false,
                min: 15,
                max: 120
            },
            occupation: {
                type: String,
                required: false,
                maxlength: 50,
                trim: true
            }
        },
        //appointment details
        preferredDate: {
            type: Date,
            required: true
        },
        preferredTime: {
            type: String,
            required: true
        },
        reasonForVisit: {
            type: String,
            trim: true,
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled', 'Rebooked'],
            default: 'Pending'
        },
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

//static method to get the next appointment number
appointmentSchema.statics.getNextAppointmentNumber = async function() {
    //find the appointment with the highest number
    const highestAppointment = await this.findOne().sort('-appointmentNumber');
    
    //ff no appointments exist, start with 0001
    if (!highestAppointment || !highestAppointment.appointmentNumber) {
        return '0001';
    }
    
    //get the numeric value and increment
    const currentNumber = parseInt(highestAppointment.appointmentNumber, 10);
    const nextNumber = currentNumber + 1;
    
    //format with leading zeros
    return String(nextNumber).padStart(4, '0');
};

//pre-validate middleware to ensure appointmentNumber is set before validation
appointmentSchema.pre('validate', async function(next) {
    try {
        if (!this.appointmentNumber) {
            this.appointmentNumber = await this.constructor.getNextAppointmentNumber();
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;