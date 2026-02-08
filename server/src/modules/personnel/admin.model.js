const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
    {
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
            enum: ['Doctor', 'Staff'],
            default: 'Doctor'
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

AdminSchema.pre('save', function(next) {
    if (!this.email && !this.contactNumber) {
        return next(new Error('Contact number is required'));
    }
    next();
});

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;