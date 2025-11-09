const { escapeCSV, formatDate, formatTime } = require('@utils/display');

class GenerateMedicalRecordFile {
    constructor() {
        this.escapeCSV = escapeCSV;
        this.formatDate = formatDate;
        this.formatTime = formatTime;
    }

    //safe date formatter
    safeFormatDate(date) {
        if (!date) return '';
        try {
            return this.formatDate(date);
        } catch (error) {
            return '';
        }
    }

    //safe datetime formatter
    safeFormatTime(datetime) {
        if (!datetime) return '';
        try {
            return this.formatTime(datetime);
        } catch (error) {
            return '';
        }
    }

    generateCSV(records) {
        const headers = [
            'MEDICAL RECORD NUMBER',
            'APPOINTMENT ID',
            'FULL NAME',
            'DATE OF BIRTH',
            'AGE',
            'GENDER',
            'BLOOD TYPE',
            'ADDRESS',
            'PHONE',
            'EMAIL',
            'EMERGENCY CONTACT',
            'ALLERGIES',
            'CHRONIC CONDITIONS',
            'PREVIOUS SURGERIES',
            'FAMILY HISTORY',
            'HEIGHT (CM)',
            'WEIGHT (KG)',
            'BMI',
            'GROWTH NOTES',
            'CHIEF COMPLAINT',
            'SYMPTOMS DESCRIPTION',
            'SYMPTOMS DURATION',
            'PAIN SCALE',
            'DIAGNOSIS',
            'TREATMENT PLAN',
            'PRESCRIBED MEDICATIONS',
            'CONSULTATION NOTES',
            'VACCINATION HISTORY',
            'FOLLOW UP DATE',
            'DATE RECORDED',
            'CREATED AT',
            'UPDATED AT'
        ];

        let csv = headers.map(h => this.escapeCSV(h)).join(',') + '\n';

        records.forEach(record => {
            const row = [
                record.medicalRecordNumber || '',
                record.appointmentId?.appointmentNumber || record.appointmentId || '',
                record.personalDetails?.fullName || '',
                this.safeFormatDate(record.personalDetails?.dateOfBirth),
                record.personalDetails?.age || '',
                record.personalDetails?.gender || '',
                record.personalDetails?.bloodType || '',
                record.personalDetails?.address || '',
                record.personalDetails?.phone || '',
                record.personalDetails?.email || '',
                record.personalDetails?.emergencyContact || '',
                record.medicalHistory?.allergies || '',
                record.medicalHistory?.chronicConditions || '',
                record.medicalHistory?.previousSurgeries || '',
                record.medicalHistory?.familyHistory || '',
                record.growthMilestones?.height || '',
                record.growthMilestones?.weight || '',
                record.growthMilestones?.bmi || '',
                record.growthMilestones?.growthNotes || '',
                record.currentSymptoms?.chiefComplaint || '',
                record.currentSymptoms?.symptomsDescription || '',
                record.currentSymptoms?.symptomsDuration || '',
                record.currentSymptoms?.painScale || '',
                record.diagnosis || '',
                record.treatmentPlan || '',
                record.prescribedMedications || '',
                record.consultationNotes || '',
                record.vaccinationHistory || '',
                this.safeFormatDate(record.followUpDate),
                this.safeFormatDate(record.dateRecorded),
                this.safeFormatTime(record.createdAt),
                this.safeFormatTime(record.updatedAt)
            ];

            csv += row.map(field => this.escapeCSV(String(field))).join(',') + '\n';
        });

        return csv;
    }

    async generateXLSX(records) {
        const ExcelJS = require('exceljs');
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Medical Records');

        //define columns based on your medical record model
        worksheet.columns = [
            { header: 'MEDICAL RECORD #', key: 'medicalRecordNumber', width: 18 },
            { header: 'APPOINTMENT #', key: 'appointmentNumber', width: 16 },
            { header: 'FULL NAME', key: 'fullName', width: 25 },
            { header: 'DATE OF BIRTH', key: 'dateOfBirth', width: 14 },
            { header: 'AGE', key: 'age', width: 6 },
            { header: 'GENDER', key: 'gender', width: 10 },
            { header: 'BLOOD TYPE', key: 'bloodType', width: 12 },
            { header: 'ADDRESS', key: 'address', width: 30 },
            { header: 'PHONE', key: 'phone', width: 15 },
            { header: 'EMAIL', key: 'email', width: 25 },
            { header: 'EMERGENCY CONTACT', key: 'emergencyContact', width: 20 },
            { header: 'ALLERGIES', key: 'allergies', width: 25 },
            { header: 'CHRONIC CONDITIONS', key: 'chronicConditions', width: 25 },
            { header: 'PREVIOUS SURGERIES', key: 'previousSurgeries', width: 25 },
            { header: 'FAMILY HISTORY', key: 'familyHistory', width: 25 },
            { header: 'HEIGHT (CM)', key: 'height', width: 12 },
            { header: 'WEIGHT (KG)', key: 'weight', width: 12 },
            { header: 'BMI', key: 'bmi', width: 10 },
            { header: 'GROWTH NOTES', key: 'growthNotes', width: 30 },
            { header: 'CHIEF COMPLAINT', key: 'chiefComplaint', width: 25 },
            { header: 'SYMPTOMS DESCRIPTION', key: 'symptomsDescription', width: 35 },
            { header: 'SYMPTOMS DURATION', key: 'symptomsDuration', width: 18 },
            { header: 'PAIN SCALE (1-10)', key: 'painScale', width: 16 },
            { header: 'DIAGNOSIS', key: 'diagnosis', width: 30 },
            { header: 'TREATMENT PLAN', key: 'treatmentPlan', width: 35 },
            { header: 'PRESCRIBED MEDICATIONS', key: 'prescribedMedications', width: 35 },
            { header: 'CONSULTATION NOTES', key: 'consultationNotes', width: 40 },
            { header: 'VACCINATION HISTORY', key: 'vaccinationHistory', width: 30 },
            { header: 'FOLLOW UP DATE', key: 'followUpDate', width: 14 },
            { header: 'DATE RECORDED', key: 'dateRecorded', width: 14 },
            { header: 'CREATED AT', key: 'createdAt', width: 18 },
            { header: 'UPDATED AT', key: 'updatedAt', width: 18 }
        ];

        //style the header row
        worksheet.getRow(1).font = { bold: true, size: 11 };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        //data rows
        records.forEach(record => {
            worksheet.addRow({
                medicalRecordNumber: record.medicalRecordNumber || '',
                appointmentNumber: record.appointmentId?.appointmentNumber || '',
                fullName: record.personalDetails?.fullName || '',
                dateOfBirth: this.safeFormatDate(record.personalDetails?.dateOfBirth),
                age: record.personalDetails?.age || '',
                gender: record.personalDetails?.gender || '',
                bloodType: record.personalDetails?.bloodType || '',
                address: record.personalDetails?.address || '',
                phone: record.personalDetails?.phone || '',
                email: record.personalDetails?.email || '',
                emergencyContact: record.personalDetails?.emergencyContact || '',
                allergies: record.medicalHistory?.allergies || '',
                chronicConditions: record.medicalHistory?.chronicConditions || '',
                previousSurgeries: record.medicalHistory?.previousSurgeries || '',
                familyHistory: record.medicalHistory?.familyHistory || '',
                height: record.growthMilestones?.height || '',
                weight: record.growthMilestones?.weight || '',
                bmi: record.growthMilestones?.bmi || '',
                growthNotes: record.growthMilestones?.growthNotes || '',
                chiefComplaint: record.currentSymptoms?.chiefComplaint || '',
                symptomsDescription: record.currentSymptoms?.symptomsDescription || '',
                symptomsDuration: record.currentSymptoms?.symptomsDuration || '',
                painScale: record.currentSymptoms?.painScale || '',
                diagnosis: record.diagnosis || '',
                treatmentPlan: record.treatmentPlan || '',
                prescribedMedications: record.prescribedMedications || '',
                consultationNotes: record.consultationNotes || '',
                vaccinationHistory: record.vaccinationHistory || '',
                followUpDate: this.safeFormatDate(record.followUpDate),
                dateRecorded: this.safeFormatDate(record.dateRecorded),
                createdAt: this.safeFormatTime(record.createdAt),
                updatedAt: this.safeFormatTime(record.updatedAt)
            });
        });

        //style all cells
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.alignment = { 
                    vertical: 'top', 
                    horizontal: 'left',
                    wrapText: true 
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    generateJSON(records) {
        return JSON.stringify(records, null, 2);
    }
}

module.exports = new GenerateMedicalRecordFile();