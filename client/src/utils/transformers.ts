import { Patient } from "../types";

export const transformPatientForAppointment = (patient: Patient) => {
    const fullName = patient.fullName ?? '';
    const nameParts = fullName.split(' ');

    return {
        id: patient.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
        middleName: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : null,
        patientNumber: patient.patientNumber || patient.id
    };
};
