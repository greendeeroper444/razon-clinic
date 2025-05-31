const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
    {
        //personal details (from form)
        personalDetails: {
            fullName: {
                type: String,
                required: [true, 'Full name is required'],
                trim: true
            },
            dateOfBirth: {
                type: Date,
                required: [true, 'Date of birth is required']
            },
            gender: {
                type: String,
                required: [true, 'Gender is required'],
                enum: ['Male', 'Female', 'Other']
            },
            bloodType: {
                type: String,
                enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
            },
            address: {
                type: String,
                trim: true
            },
            phone: {
                type: String,
                required: [true, 'Phone number is required'],
                trim: true
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
                validate: {
                    validator: function(v) {
                        return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
                    },
                    message: 'Please enter a valid email address'
                }
            },
            emergencyContact: {
                type: String,
                trim: true
            }
        },

        //medical history (enhanced from form)
        medicalHistory: {
            allergies: {
                type: String,
                trim: true
            },
            chronicConditions: {
                type: String,
                trim: true
            },
            previousSurgeries: {
                type: String,
                trim: true
            },
            familyHistory: {
                type: String,
                trim: true
            },
            //keep existing field for backward compatibility
            general: {
                type: String,
                trim: true
            }
        },

        //growth milestones (enhanced from form)
        growthMilestones: {
            height: {
                type: Number,
                min: [0, 'Height must be a positive number']
            },
            weight: {
                type: Number,
                min: [0, 'Weight must be a positive number']
            },
            bmi: {
                type: Number,
                min: [0, 'BMI must be a positive number']
            },
            growthNotes: {
                type: String,
                trim: true
            },
            //keep existing field for backward compatibility
            general: {
                type: String,
                trim: true
            }
        },

        //vaccination history (keep existing)
        vaccinationHistory: {
            type: String,
            trim: true
        },

        //current symptoms (enhanced from form)
        currentSymptoms: {
            chiefComplaint: {
                type: String,
                required: [true, 'Chief complaint is required'],
                trim: true
            },
            symptomsDescription: {
                type: String,
                required: [true, 'Symptoms description is required'],
                trim: true
            },
            symptomsDuration: {
                type: String,
                trim: true
            },
            painScale: {
                type: Number,
                min: [1, 'Pain scale must be between 1 and 10'],
                max: [10, 'Pain scale must be between 1 and 10']
            },
            //keep existing field for backward compatibility
            general: {
                type: String,
                trim: true
            }
        },

        //keep existing fields
        diagnosis: {
            type: String,
            trim: true
        },
        treatmentPlan: {
            type: String,
            trim: true
        },
        prescribedMedications: {
            type: String,
            trim: true
        },
        consultationNotes: {
            type: String,
            trim: true
        },
        followUpDate: {
            type: Date
        },
        dateRecorded: {
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
            },
            virtuals: true
        },
        toObject: { virtuals: true }
    }
);

//virtual for age calculation
medicalRecordSchema.virtual('personalDetails.age').get(function() {
    if (!this.personalDetails?.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.personalDetails.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
});

//method to calculate BMI
medicalRecordSchema.methods.calculateBMI = function() {
    const height = this.growthMilestones?.height;
    const weight = this.growthMilestones?.weight;
    
    if (height && weight) {
        const heightInMeters = height / 100;
        return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }
    return null;
};

//pre-save middleware to auto-calculate BMI
medicalRecordSchema.pre('save', function(next) {
    if (this.growthMilestones?.height && 
        this.growthMilestones?.weight && 
        !this.growthMilestones?.bmi) {
        this.growthMilestones.bmi = this.calculateBMI();
    }
    next();
});

//indexes for better query performance
medicalRecordSchema.index({ 'personalDetails.fullName': 1 });
medicalRecordSchema.index({ 'personalDetails.email': 1 });
medicalRecordSchema.index({ 'personalDetails.phone': 1 });
medicalRecordSchema.index({ dateRecorded: -1 });
medicalRecordSchema.index({ followUpDate: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;