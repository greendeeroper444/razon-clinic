const mongoose = require('mongoose');

const OnlinePatientSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 30
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