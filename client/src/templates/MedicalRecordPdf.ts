// import { BasePDFTemplate } from './basePdfTemplate';
// import { MedicalRecord } from '../types';

// export class MedicalRecordPDF extends BasePDFTemplate {
//     private record: MedicalRecord;

//     constructor(record: MedicalRecord) {
//         super();
//         this.record = record;
//     }

//     protected buildDocument(): void {
//         this.drawHeader('MEDICAL RECORD REPORT');

//         this.drawPatientInformation();

//         this.drawMedicalDetailsTable();

//         this.drawClinicalNotes();

//         this.drawTreatmentPlan();

//         this.drawFollowUpInfo();

//         this.drawFooter(['For inquiries: drnice4kids@gmail.com | +0939-726-6918']);
//     }

//     private drawPatientInformation(): void {
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(11);
//         this.doc.text('Child Information', 20, this.currentY);
//         this.currentY += 8;

//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setFontSize(10);

//         const patientInfo = [
//             `Name: ${this.record.personalDetails.fullName}`,
//             `Date of Birth: ${this.formatDate(this.record.personalDetails.dateOfBirth)}`,
//             `Age: ${this.calculateAge(this.record.personalDetails.dateOfBirth)}`,
//             `Gender: ${this.record.personalDetails.gender}`,
//             `Phone: ${this.record.personalDetails.phone}`,
//             `Record Date: ${this.formatDate(this.record.dateRecorded)}`,
//         ];

//         patientInfo.forEach(line => {
//             this.doc.text(line, 20, this.currentY);
//             this.currentY += 6;
//         });

//         this.currentY += 5;
//         this.drawDivider();
//     }

//     private drawMedicalDetailsTable(): void {
//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(12);
//         this.doc.text('Medical Record Details', 20, this.currentY);
//         this.currentY += 10;

//         const tableData = this.prepareMedicalTableData();
        
//         this.drawTable(
//             ['Category', 'Details'],
//             tableData,
//             {
//                 0: { cellWidth: 50, fontStyle: 'bold', halign: 'left' },
//                 1: { cellWidth: 130, halign: 'left' }
//             }
//         );
//     }

//     private drawClinicalNotes(): void {
//         if (!this.record.consultationNotes || this.record.consultationNotes.trim() === '') {
//             return;
//         }

//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(12);
//         this.doc.text('Clinical Notes:', 20, this.currentY);
//         this.currentY += 8;

//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setFontSize(9);
//         this.addWrappedText(this.record.consultationNotes);
//     }

//     private drawTreatmentPlan(): void {
//         if (!this.record.treatmentPlan || this.record.treatmentPlan.trim() === '') {
//             return;
//         }

//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(12);
//         this.doc.text('Treatment Plan:', 20, this.currentY);
//         this.currentY += 8;

//         this.doc.setFont('helvetica', 'normal');
//         this.doc.setFontSize(9);
//         this.addWrappedText(this.record.treatmentPlan);
//     }

//     private drawFollowUpInfo(): void {
//         if (!this.record.followUpDate) {
//             return;
//         }

//         this.doc.setFont('helvetica', 'bold');
//         this.doc.setFontSize(12);
//         this.doc.text('Follow-up Appointment:', 20, this.currentY);
        
//         this.doc.setFont('helvetica', 'normal');
//         this.doc.text(
//             `Scheduled for ${this.formatDate(this.record.followUpDate)}`,
//             80,
//             this.currentY
//         );
        
//         this.currentY += 15;
//     }

//     private prepareMedicalTableData(): string[][] {
//         const data: string[][] = [];

//         data.push(['Full Name', this.record.personalDetails.fullName]);
//         data.push(['Age', this.calculateAge(this.record.personalDetails.dateOfBirth)]);
//         data.push(['Blood Type', this.record.personalDetails.bloodType || 'Not specified']);
//         data.push(['Email', this.record.personalDetails.email || 'Not provided']);
//         data.push(['Address', this.record.personalDetails.address || 'Not provided']);
//         data.push(['Emergency Contact', this.record.personalDetails.emergencyContact || 'Not provided']);

//         data.push(['Chief Complaint', String(this.record.currentSymptoms.chiefComplaint)]);
//         data.push(['Symptoms', String(this.record.currentSymptoms.symptomsDescription)]);

//         if (this.record.currentSymptoms.symptomsDuration) {
//             data.push(['Duration', String(this.record.currentSymptoms.symptomsDuration)]);
//         }

//         if (this.record.currentSymptoms.painScale && this.record.currentSymptoms.painScale > 0) {
//             data.push(['Pain Scale', `${this.record.currentSymptoms.painScale}/10`]);
//         }

//         this.addOptionalField(data, 'Allergies', this.record.medicalHistory.allergies);
//         this.addOptionalField(data, 'Chronic Conditions', this.record.medicalHistory.chronicConditions);
//         this.addOptionalField(data, 'Previous Surgeries', this.record.medicalHistory.previousSurgeries);
//         this.addOptionalField(data, 'Family History', this.record.medicalHistory.familyHistory);

//         if (this.record.growthMilestones.height && this.record.growthMilestones.height > 0) {
//             data.push(['Height', `${this.record.growthMilestones.height} cm`]);
//         }

//         if (this.record.growthMilestones.weight && this.record.growthMilestones.weight > 0) {
//             data.push(['Weight', `${this.record.growthMilestones.weight} kg`]);
//         }

//         this.addOptionalField(data, 'BMI', this.record.growthMilestones.bmi);
//         this.addOptionalField(data, 'Growth Notes', this.record.growthMilestones.growthNotes);

//         this.addOptionalField(data, 'Diagnosis', this.record.diagnosis);
//         this.addOptionalField(data, 'Medications', this.record.prescribedMedications);
//         this.addOptionalField(data, 'Vaccinations', this.record.vaccinationHistory);

//         return data;
//     }

//     private addOptionalField(data: string[][], label: string, value: any): void {
//         if (value && String(value).trim() !== '') {
//             data.push([label, String(value)]);
//         }
//     }

//     private calculateAge(dateOfBirth: string): string {
//         if (!dateOfBirth) return '0 months old';
        
//         const today = new Date();
//         const birthDate = new Date(dateOfBirth);
        
//         let years = today.getFullYear() - birthDate.getFullYear();
//         let months = today.getMonth() - birthDate.getMonth();
        
//         if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
//             years--;
//             months += 12;
//         }
        
//         if (today.getDate() < birthDate.getDate()) {
//             months--;
//         }
        
//         if (years === 0) {
//             if (months === 0) {
//                 return 'Less than 1 month old';
//             } else if (months === 1) {
//                 return '1 month old';
//             } else {
//                 return `${months} months old`;
//             }
//         } else if (years === 1) {
//             return '1 year old';
//         } else {
//             return `${years} years old`;
//         }
//     }

//     private formatDate(date: string | Date): string {
//         return new Date(date).toLocaleDateString();
//     }
// }

// export const generateMedicalRecordPDF = (record: MedicalRecord): void => {
//     const fileName = `medical-record-${record.personalDetails.fullName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
//     const pdfGenerator = new MedicalRecordPDF(record);
//     pdfGenerator.generate(fileName);
// };

// export const getMedicalRecordBlob = (record: MedicalRecord): Blob => {
//     const pdfGenerator = new MedicalRecordPDF(record);
//     return pdfGenerator.getBlob();
// };


import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MedicalRecord } from '../types';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: AutoTableOptions) => jsPDF;
        lastAutoTable?: {
            finalY: number;
        };
    }
}

interface AutoTableOptions {
    startY?: number;
    head?: string[][];
    body?: string[][];
    styles?: Record<string, any>;
    headStyles?: Record<string, any>;
    columnStyles?: Record<number, Record<string, any>>;
    margin?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
    };
    theme?: 'striped' | 'grid' | 'plain';
    [key: string]: any;
}

const Colors = {
    primary: [59, 130, 246] as [number, number, number],
    success: [34, 197, 94] as [number, number, number],
    warning: [251, 191, 36] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    gray: [100, 100, 100] as [number, number, number],
    lightGray: [200, 200, 200] as [number, number, number],
    black: [0, 0, 0] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
} as const;

const Config = {
    clinicName: 'Razon Pediatric Clinic',
    address: '4J38+73R, Gladiola St, Buhangin, Davao City, 8000 Davao del Sur',
    email: 'drnice4kids@gmail.com',
    phone: '+0939-726-6918',
    margins: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
    },
    pageWidth: 210, // A4 width in mm
} as const;

export class MedicalRecordPDF {
    private doc: jsPDF;
    private currentY: number = 20;
    private record: MedicalRecord;

    constructor(record: MedicalRecord) {
        this.doc = new jsPDF();
        this.record = record;
    }

    // ─── Base drawing helpers ────────────────────────────────────────────────

    private drawHeader(title: string): void {
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.primary);
        this.doc.text(Config.clinicName, 105, this.currentY, { align: 'center' });
        this.currentY += 8;

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...Colors.black);

        const contactInfo = [
            Config.address,
            `Email: ${Config.email} | Phone: ${Config.phone}`,
        ];

        contactInfo.forEach(line => {
            this.doc.text(line, 105, this.currentY, { align: 'center' });
            this.currentY += 5;
        });

        this.currentY += 2;
        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.line(Config.margins.left, this.currentY, 190, this.currentY);
        this.currentY += 10;

        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...Colors.black);
        this.doc.text(title, 105, this.currentY, { align: 'center' });
        this.currentY += 12;
    }

    private drawTable(
        headers: string[],
        data: string[][],
        columnStyles?: Record<number, Record<string, any>>,
        tableWidth: 'auto' | 'wrap' | number = 'auto'
    ): void {
        autoTable(this.doc, {
            startY: this.currentY,
            head: [headers],
            body: data,
            styles: {
                fontSize: 10,
                cellPadding: 5,
                halign: 'center',
            },
            headStyles: {
                fillColor: Colors.primary,
                textColor: Colors.white,
                fontStyle: 'bold',
                halign: 'center',
            },
            columnStyles: columnStyles || {},
            theme: 'striped',
            tableWidth,
            margin: { left: Config.margins.left, right: Config.margins.right },
        });

        this.currentY = this.doc.lastAutoTable?.finalY
            ? this.doc.lastAutoTable.finalY + 10
            : this.currentY + 50;
    }

    private drawDivider(color: [number, number, number] = Colors.lightGray): void {
        this.doc.setDrawColor(...color);
        this.doc.line(Config.margins.left, this.currentY, 190, this.currentY);
        this.currentY += 8;
    }

    private addWrappedText(text: string, maxWidth: number = 170): void {
        const lines = this.doc.splitTextToSize(text, maxWidth);
        this.doc.text(lines, Config.margins.left, this.currentY);
        this.currentY += lines.length * 5 + 5;
    }

    private drawFooter(additionalInfo?: string[]): void {
        const footerY = 270;

        this.doc.setDrawColor(...Colors.lightGray);
        this.doc.line(Config.margins.left, footerY, 190, footerY);

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(8);
        this.doc.setTextColor(...Colors.gray);

        const footerLines = [
            'This is a computer-generated document and does not require a signature.',
            `Generated on: ${new Date().toLocaleString()}`,
            `Thank you for choosing ${Config.clinicName}!`,
            ...(additionalInfo || []),
        ];

        let yPos = footerY + 5;
        footerLines.forEach(line => {
            this.doc.text(line, 105, yPos, { align: 'center' });
            yPos += 4;
        });
    }

    // ─── Medical record sections ─────────────────────────────────────────────

    private drawPatientInformation(): void {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(11);
        this.doc.text('Child Information', 20, this.currentY);
        this.currentY += 8;

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);

        const patientInfo = [
            `Name: ${this.record.personalDetails.fullName}`,
            `Date of Birth: ${this.formatDate(this.record.personalDetails.dateOfBirth)}`,
            `Age: ${this.calculateAge(this.record.personalDetails.dateOfBirth)}`,
            `Gender: ${this.record.personalDetails.gender}`,
            `Phone: ${this.record.personalDetails.phone}`,
            `Record Date: ${this.formatDate(this.record.dateRecorded)}`,
        ];

        patientInfo.forEach(line => {
            this.doc.text(line, 20, this.currentY);
            this.currentY += 6;
        });

        this.currentY += 5;
        this.drawDivider();
    }

    private drawMedicalDetailsTable(): void {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(12);
        this.doc.text('Medical Record Details', 20, this.currentY);
        this.currentY += 10;

        const tableData = this.prepareMedicalTableData();

        this.drawTable(
            ['Category', 'Details'],
            tableData,
            {
                0: { cellWidth: 50, fontStyle: 'bold', halign: 'left' },
                1: { cellWidth: 130, halign: 'left' },
            }
        );
    }

    private drawClinicalNotes(): void {
        if (!this.record.consultationNotes || this.record.consultationNotes.trim() === '') {
            return;
        }

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(12);
        this.doc.text('Clinical Notes:', 20, this.currentY);
        this.currentY += 8;

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        this.addWrappedText(this.record.consultationNotes);
    }

    private drawTreatmentPlan(): void {
        if (!this.record.treatmentPlan || this.record.treatmentPlan.trim() === '') {
            return;
        }

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(12);
        this.doc.text('Treatment Plan:', 20, this.currentY);
        this.currentY += 8;

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);
        this.addWrappedText(this.record.treatmentPlan);
    }

    private drawFollowUpInfo(): void {
        if (!this.record.followUpDate) {
            return;
        }

        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(12);
        this.doc.text('Follow-up Appointment:', 20, this.currentY);

        this.doc.setFont('helvetica', 'normal');
        this.doc.text(
            `Scheduled for ${this.formatDate(this.record.followUpDate)}`,
            80,
            this.currentY
        );

        this.currentY += 15;
    }

    // ─── Data helpers ────────────────────────────────────────────────────────

    private prepareMedicalTableData(): string[][] {
        const data: string[][] = [];

        data.push(['Full Name', this.record.personalDetails.fullName]);
        data.push(['Age', this.calculateAge(this.record.personalDetails.dateOfBirth)]);
        data.push(['Blood Type', this.record.personalDetails.bloodType || 'Not specified']);
        data.push(['Email', this.record.personalDetails.email || 'Not provided']);
        data.push(['Address', this.record.personalDetails.address || 'Not provided']);
        data.push(['Emergency Contact', this.record.personalDetails.emergencyContact || 'Not provided']);

        data.push(['Chief Complaint', String(this.record.currentSymptoms.chiefComplaint)]);
        data.push(['Symptoms', String(this.record.currentSymptoms.symptomsDescription)]);

        if (this.record.currentSymptoms.symptomsDuration) {
            data.push(['Duration', String(this.record.currentSymptoms.symptomsDuration)]);
        }

        if (this.record.currentSymptoms.painScale && this.record.currentSymptoms.painScale > 0) {
            data.push(['Pain Scale', `${this.record.currentSymptoms.painScale}/10`]);
        }

        this.addOptionalField(data, 'Allergies', this.record.medicalHistory.allergies);
        this.addOptionalField(data, 'Chronic Conditions', this.record.medicalHistory.chronicConditions);
        this.addOptionalField(data, 'Previous Surgeries', this.record.medicalHistory.previousSurgeries);
        this.addOptionalField(data, 'Family History', this.record.medicalHistory.familyHistory);

        if (this.record.growthMilestones.height && this.record.growthMilestones.height > 0) {
            data.push(['Height', `${this.record.growthMilestones.height} cm`]);
        }

        if (this.record.growthMilestones.weight && this.record.growthMilestones.weight > 0) {
            data.push(['Weight', `${this.record.growthMilestones.weight} kg`]);
        }

        this.addOptionalField(data, 'BMI', this.record.growthMilestones.bmi);
        this.addOptionalField(data, 'Growth Notes', this.record.growthMilestones.growthNotes);
        this.addOptionalField(data, 'Diagnosis', this.record.diagnosis);
        this.addOptionalField(data, 'Medications', this.record.prescribedMedications);
        this.addOptionalField(data, 'Vaccinations', this.record.vaccinationHistory);

        return data;
    }

    private addOptionalField(data: string[][], label: string, value: any): void {
        if (value && String(value).trim() !== '') {
            data.push([label, String(value)]);
        }
    }

    private calculateAge(dateOfBirth: string): string {
        if (!dateOfBirth) return '0 months old';

        const today = new Date();
        const birthDate = new Date(dateOfBirth);

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }

        if (today.getDate() < birthDate.getDate()) {
            months--;
        }

        if (years === 0) {
            if (months === 0) return 'Less than 1 month old';
            if (months === 1) return '1 month old';
            return `${months} months old`;
        }

        return years === 1 ? '1 year old' : `${years} years old`;
    }

    private formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString();
    }

    // ─── Document entry point ────────────────────────────────────────────────

    private buildDocument(): void {
        this.drawHeader('MEDICAL RECORD REPORT');
        this.drawPatientInformation();
        this.drawMedicalDetailsTable();
        this.drawClinicalNotes();
        this.drawTreatmentPlan();
        this.drawFollowUpInfo();
        this.drawFooter(['For inquiries: drnice4kids@gmail.com | +0939-726-6918']);
    }

    public generate(filename: string): void {
        this.buildDocument();
        this.doc.save(filename);
    }

    public getBlob(): Blob {
        this.buildDocument();
        return this.doc.output('blob');
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const generateMedicalRecordPDF = (record: MedicalRecord): void => {
    const fileName = `medical-record-${record.personalDetails.fullName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    new MedicalRecordPDF(record).generate(fileName);
};

export const getMedicalRecordBlob = (record: MedicalRecord): Blob => {
    return new MedicalRecordPDF(record).getBlob();
};