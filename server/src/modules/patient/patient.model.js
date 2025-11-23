const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
    {
        patientNumber: {
            type: String,
            unique: true
        },
        firstName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50
        },
        lastName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50
        },
        middleName: {
            type: String,
            minlength: 3,
            maxlength: 50
        },
        suffix: {
            type: String,
            maxlength: 10,
            trim: true,
            enum: ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V', '']
        },
        email: {
            type: String,
        },
        contactNumber: {
            type: String
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
        bloodPressure: {
            systolic: {
                type: Number,
                required: false,
                min: 40,
                max: 300
            },
            diastolic: {
                type: Number,
                required: false,
                min: 20,
                max: 200
            }
        },
        temperature: {
            type: Number,
            required: false,
            min: 30,
            max: 45
        },
        address: {
            type: String,
            required: true,
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
        religion: {
            type: String,
            required: false,
            maxlength: 30,
            trim: true
        },
        isArchived: {
            type: Boolean,
            default: false
        },
        archivedAt: {
            type: Date,
            default: null
        },
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null
        },
        lastActiveAt: {
            type: Date,
            default: Date.now
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


PatientSchema.statics.getNextPatientNumber = async function() {
    const highestPatient = await this.findOne().sort('-patientNumber');
    
    if (!highestPatient || !highestPatient.patientNumber) {
        return '0001';
    }
    
    const currentNumber = parseInt(highestPatient.patientNumber, 10);
    const nextNumber = currentNumber + 1;
    
    return String(nextNumber).padStart(4, '0');
};

PatientSchema.pre('validate', async function(next) {
    try {
        if (!this.patientNumber) {
            this.patientNumber = await this.constructor.getNextPatientNumber();
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Patient = mongoose.model('Patient', PatientSchema);

module.exports = Patient;