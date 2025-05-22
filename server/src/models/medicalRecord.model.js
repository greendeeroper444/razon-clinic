const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        medicalHistory: {
            type: String,
            trim: true
        },
        growthMilestones: {
            type: String,
            trim: true
        },
        vaccinationHistory: {
            type: String,
            trim: true
        },
        currentSymptoms: {
            type: String,
            trim: true
        },
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
            }
        }
    }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord;
