const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
    {
        medicalRecordNumber: {
            type: String,
            unique: true
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
        },
        
        personalDetails: {
            fullName: {
                type: String,
                required: true,
                trim: true
            },
            dateOfBirth: {
                type: Date,
                required: true
            },
            gender: {
                type: String,
                required: true,
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
                required: true,
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
            general: {
                type: String,
                trim: true
            }
        },

        growthMilestones: {
            height: {
                type: Number,
                min: 0
            },
            weight: {
                type: Number,
                min: 0
            },
            bmi: {
                type: Number,
                min: 0
            },
            growthNotes: {
                type: String,
                trim: true
            },
            general: {
                type: String,
                trim: true
            }
        },

        vaccinationHistory: {
            type: String,
            trim: true
        },

        currentSymptoms: {
            chiefComplaint: {
                type: String,
                required: true,
                trim: true
            },
            symptomsDescription: {
                type: String,
                required: true,
                trim: true
            },
            symptomsDuration: {
                type: String,
                trim: true
            },
            painScale: {
                type: Number,
                min: 1,
                max: 10
            },
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
        },
        deletedAt: {
            type: Date,
            default: null
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

medicalRecordSchema.methods.calculateBMI = function() {
    const height = this.growthMilestones?.height;
    const weight = this.growthMilestones?.weight;
    
    if (height && weight) {
        const heightInMeters = height / 100;
        return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }
    return null;
};

medicalRecordSchema.statics.getNextMedicalRecordNumber = async function() {
    const highestMedicalRecord = await this.findOne().sort('-medicalRecordNumber');
    
    if (!highestMedicalRecord || !highestMedicalRecord.medicalRecordNumber) {
        return '0001';
    }
    
    const currentNumber = parseInt(highestMedicalRecord.medicalRecordNumber, 10);
    const nextNumber = currentNumber + 1;
    
    return String(nextNumber).padStart(4, '0');
};

medicalRecordSchema.pre('validate', async function(next) {
    try {
        if (!this.medicalRecordNumber) {
            this.medicalRecordNumber = await this.constructor.getNextMedicalRecordNumber();
        }
        next();
    } catch (error) {
        next(error);
    }
});

medicalRecordSchema.pre('save', function(next) {
    if (this.growthMilestones?.height && 
        this.growthMilestones?.weight && 
        !this.growthMilestones?.bmi) {
        this.growthMilestones.bmi = this.calculateBMI();
    }
    next();
});

medicalRecordSchema.index({ 'personalDetails.fullName': 1 });
medicalRecordSchema.index({ 'personalDetails.email': 1 });
medicalRecordSchema.index({ 'personalDetails.phone': 1 });
medicalRecordSchema.index({ dateRecorded: -1 });
medicalRecordSchema.index({ followUpDate: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;