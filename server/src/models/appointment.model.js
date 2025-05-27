const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        appointmentNumber: {
            type: String,
            unique: true
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OnlinePatient',
        },
        fullName: {
            type: String,
            required: true
        },
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
        birthdate: {
            type: Date,
            required: true
        },
        sex: {
            type: String,
            required: true,
            enum: ['Male', 'Female', 'Other']
        },
        height: {
            type: Number, // in cm or inches
            required: false,
            min: 30,  // realistic minimum height
            max: 300  // realistic maximum height
        },
        weight: {
            type: Number, // in kg or lbs
            required: false,
            min: 1,   // realistic minimum weight
            max: 500  // realistic maximum weight
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
        religion: {
            type: String,
            required: false,
            maxlength: 30,
            trim: true
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