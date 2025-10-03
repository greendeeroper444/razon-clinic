const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        userNumber: {
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
                delete ret.password;
                return ret;
            }
        }
    }
);

//static method to get the next patient number
UserSchema.statics.getNextUserNumber = async function() {
    //find the patient with the highest number
    const highestUser = await this.findOne().sort('-userNumber');
    
    //if no patients exist, start with 0001
    if (!highestUser || !highestUser.userNumber) {
        return '0001';
    }
    
    //get the numeric value and increment
    const currentNumber = parseInt(highestUser.userNumber, 10);
    const nextNumber = currentNumber + 1;
    
    //format with leading zeros
    return String(nextNumber).padStart(4, '0');
};

//pre-validate middleware to ensure userNumber is set before validation
UserSchema.pre('validate', async function(next) {
    try {
        if (!this.userNumber) {
            this.userNumber = await this.constructor.getNextUserNumber();
        }
        next();
    } catch (error) {
        next(error);
    }
});

//pre-save middleware to ensure either email or contactNumber is provided
UserSchema.pre('save', function(next) {
    if (!this.email && !this.contactNumber) {
        return next(new Error('Either email or contact number is required'));
    }
    next();
});

//create model from schema
const User = mongoose.model('User', UserSchema);

module.exports = User;