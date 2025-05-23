const mongoose = require('mongoose');

const PersonalPatientSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 50
        },
        email: {
            type: String,
        },
        contactNumber: {
            type: String,
            required: true
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

const PersonalPatient = mongoose.model('PersonalPatient', PersonalPatientSchema);

module.exports = PersonalPatient;