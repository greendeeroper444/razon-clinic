import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MedicalRecord } from '../types/medical'

//typescript declaration for autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: {
            startY?: number;
            head?: string[][];
            body?: string[][];
            styles?: {
                fontSize?: number;
                cellPadding?: number;
                [key: string]: any;
            };
            headStyles?: {
                fillColor?: number[];
                textColor?: number[];
                fontStyle?: string;
                [key: string]: any;
            };
            columnStyles?: {
                [key: number]: {
                cellWidth?: number;
                halign?: 'left' | 'center' | 'right';
                [key: string]: any;
                };
            };
            margin?: {
                left?: number;
                right?: number;
                top?: number;
                bottom?: number;
            };
            [key: string]: any;
        }) => jsPDF;
        lastAutoTable?: {
            finalY: number;
        };
    }
}

export const generateMedicalReceiptPDF = (record: MedicalRecord): void => {
    const doc = new jsPDF();
    
    //logo and header
    const logoText = 'Razon Pediatric Clinic Receipt';
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 139, 34);
    doc.text(logoText, 105, 25, { align: 'center' });
    
    //medical center information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const clinicInfo = [
        'Razon Pediatric Clinic',
        '4J38+73R, Gladiola St, Buhangin, Davao City, 8000 Davao del Sur',
        '',
        `Medical Record Report`,
        `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        '',
        `Patient: ${record.personalDetails.fullName}`,
        `Date of Birth: ${new Date(record.personalDetails.dateOfBirth).toLocaleDateString()}`,
        `Gender: ${record.personalDetails.gender}`,
        `Phone: ${record.personalDetails.phone}`,
        `Record Date: ${new Date(record.dateRecorded).toLocaleDateString()}`,
    ];
    
    let yPosition = 35;
    clinicInfo.forEach(line => {
        if (line.startsWith('Medical Record Report') || line.startsWith('Generated:')) {
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
    });
    
    yPosition += 10;
    
    //medical record details section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical Record Details', 20, yPosition);
    yPosition += 5;
    
    //draw line separator
    doc.setDrawColor(0, 0, 0);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    //medical information table
    const medicalData = generateMedicalData(record);
    
    //use the imported autoTable function
    autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Details']],
        body: medicalData,
        styles: {
            fontSize: 9,
            cellPadding: 4,
        },
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 40, fontStyle: 'bold' },
            1: { cellWidth: 140 },
        },
        margin: { left: 20, right: 20 },
    });
    
    //additional information Section
    yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : yPosition + 50;
    
    //clinical notes if available
    if (record.consultationNotes && record.consultationNotes.trim() !== '') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Clinical Notes:', 20, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitNotes = doc.splitTextToSize(record.consultationNotes, 170);
        doc.text(splitNotes, 20, yPosition);
        yPosition += splitNotes.length * 4 + 10;
    }
    
    //treatment plan if available
    if (record.treatmentPlan && record.treatmentPlan.trim() !== '') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Treatment Plan:', 20, yPosition);
        yPosition += 8;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitTreatment = doc.splitTextToSize(record.treatmentPlan, 170);
        doc.text(splitTreatment, 20, yPosition);
        yPosition += splitTreatment.length * 4 + 10;
    }
    
    //follow-up information
    if (record.followUpDate) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Follow-up Appointment:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`Scheduled for ${new Date(record.followUpDate).toLocaleDateString()}`, 80, yPosition);
        yPosition += 15;
    }
    
    //footer
    yPosition = Math.max(yPosition, 260);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const footerText = [
        'This is a computer-generated medical record report.',
        'For inquiries, please contact us at: drnice4kids@gmail.com | +0939-726-6918',
        `Report generated on: ${new Date().toLocaleString()}`
    ];
    
    footerText.forEach(line => {
        doc.text(line, 105, yPosition, { align: 'center' });
        yPosition += 4;
    });
    
    // save the PDF
    const fileName = `medical-record-${record.personalDetails.fullName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    };

    const calculateAge = (dateOfBirth: string): string => {
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
            if (months === 0) {
                return 'Less than 1 month old';
            } else if (months === 1) {
                return '1 month old';
            } else {
                return `${months} months old`;
            }
        } else if (years === 1) {
            return '1 year old';
        } else {
            return `${years} years old`;
        }
    };

const generateMedicalData = (record: MedicalRecord): string[][] => {
    const data: string[][] = [];
    
    //personal Information
    data.push(['Full Name', record.personalDetails.fullName]);
    data.push(['Age', calculateAge(record.personalDetails.dateOfBirth)]);
    data.push(['Blood Type', record.personalDetails.bloodType || 'Not specified']);
    data.push(['Email', record.personalDetails.email || 'Not provided']);
    data.push(['Address', record.personalDetails.address || 'Not provided']);
    data.push(['Emergency Contact', record.personalDetails.emergencyContact || 'Not provided']);
    
    //current Symptoms
    data.push(['Chief Complaint', String(record.currentSymptoms.chiefComplaint)]);
    data.push(['Symptoms Description', String(record.currentSymptoms.symptomsDescription)]);
    
    if (record.currentSymptoms.symptomsDuration) {
        data.push(['Symptoms Duration', String(record.currentSymptoms.symptomsDuration)]);
    }
    
    if (record.currentSymptoms.painScale && record.currentSymptoms.painScale > 0) {
        data.push(['Pain Scale', `${record.currentSymptoms.painScale}/10`]);
    }
    
    //medical History
    if (record.medicalHistory.allergies && String(record.medicalHistory.allergies).trim() !== '') {
        data.push(['Allergies', String(record.medicalHistory.allergies)]);
    }
    
    if (record.medicalHistory.chronicConditions && String(record.medicalHistory.chronicConditions).trim() !== '') {
        data.push(['Chronic Conditions', String(record.medicalHistory.chronicConditions)]);
    }
    
    if (record.medicalHistory.previousSurgeries && String(record.medicalHistory.previousSurgeries).trim() !== '') {
        data.push(['Previous Surgeries', String(record.medicalHistory.previousSurgeries)]);
    }
    
    if (record.medicalHistory.familyHistory && String(record.medicalHistory.familyHistory).trim() !== '') {
        data.push(['Family History', String(record.medicalHistory.familyHistory)]);
    }
    
    //growth Milestones
    if (record.growthMilestones.height && record.growthMilestones.height > 0) {
        data.push(['Height', `${record.growthMilestones.height} cm`]);
    }
    
    if (record.growthMilestones.weight && record.growthMilestones.weight > 0) {
        data.push(['Weight', `${record.growthMilestones.weight} kg`]);
    }
    
    if (record.growthMilestones.bmi && String(record.growthMilestones.bmi).trim() !== '') {
        data.push(['BMI', String(record.growthMilestones.bmi)]);
    }
    
    if (record.growthMilestones.growthNotes && String(record.growthMilestones.growthNotes).trim() !== '') {
        data.push(['Growth Notes', String(record.growthMilestones.growthNotes)]);
    }
    
    //clinical Information
    if (record.diagnosis && String(record.diagnosis).trim() !== '') {
        data.push(['Diagnosis', String(record.diagnosis)]);
    }
    
    if (record.prescribedMedications && String(record.prescribedMedications).trim() !== '') {
        data.push(['Prescribed Medications', String(record.prescribedMedications)]);
    }
    
    if (record.vaccinationHistory && String(record.vaccinationHistory).trim() !== '') {
        data.push(['Vaccination History', String(record.vaccinationHistory)]);
    }
    
    return data;
};