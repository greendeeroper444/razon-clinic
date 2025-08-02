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
        isArchive: {
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
                delete ret.password;
                return ret;
            }
        }
    }
);


//static method to get the next patient number
PatientSchema.statics.getNextPatientNumber = async function() {
    //find the patient with the highest number
    const highestPatient = await this.findOne().sort('-patientNumber');
    
    //if no patients exist, start with 0001
    if (!highestPatient || !highestPatient.patientNumber) {
        return '0001';
    }
    
    //get the numeric value and increment
    const currentNumber = parseInt(highestPatient.patientNumber, 10);
    const nextNumber = currentNumber + 1;
    
    //format with leading zeros
    return String(nextNumber).padStart(4, '0');
};

//pre-validate middleware to ensure patientNumber is set before validation
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