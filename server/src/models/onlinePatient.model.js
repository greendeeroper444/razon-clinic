const mongoose = require('mongoose');

const OnlinePatientSchema = new mongoose.Schema(
    {
        patientNumber: {
            type: String,
            unique: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        //separate email and contactNumber fields for better validation
        email: {
            type: String,
            trim: true,
            lowercase: true,
            //allow email to be optional but enforce uniqueness when present
            sparse: true,
            unique: true,
            validate: {
                validator: function(v) {
                    //return true if empty or valid email format
                    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: 'Please provide a valid email address'
            }
        },
        contactNumber: {
            type: String,
            trim: true,
            //allow contactNumber to be optional but enforce uniqueness when present
            sparse: true,
            unique: true,
            validate: {
                validator: function(v) {
                    //return true if empty or valid PH number format
                    return !v || /^(09|\+639)\d{9}$/.test(v);
                },
                message: 'Please provide a valid contact number'
            }
        },
        password: {
            type: String,
            required: true,
            select: false
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
        dateRegistered: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            required: true,
            default: 'Patient'
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
OnlinePatientSchema.statics.getNextPatientNumber = async function() {
    //find the patient with the highest number
    const highestOnlinePatient = await this.findOne().sort('-patientNumber');
    
    //if no patients exist, start with 0001
    if (!highestOnlinePatient || !highestOnlinePatient.patientNumber) {
        return '0001';
    }
    
    //get the numeric value and increment
    const currentNumber = parseInt(highestOnlinePatient.patientNumber, 10);
    const nextNumber = currentNumber + 1;
    
    //format with leading zeros
    return String(nextNumber).padStart(4, '0');
};

//pre-validate middleware to ensure patientNumber is set before validation
OnlinePatientSchema.pre('validate', async function(next) {
    try {
        if (!this.patientNumber) {
            this.patientNumber = await this.constructor.getNextPatientNumber();
        }
        next();
    } catch (error) {
        next(error);
    }
});

//pre-save middleware to ensure either email or contactNumber is provided
OnlinePatientSchema.pre('save', function(next) {
    if (!this.email && !this.contactNumber) {
        return next(new Error('Either email or contact number is required'));
    }
    next();
});

//create model from schema
const OnlinePatient = mongoose.model('OnlinePatient', OnlinePatientSchema);

module.exports = OnlinePatient;