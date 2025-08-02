import { PatientProcessingData } from "../types";
import { cleanObject } from "./clean";

export const processPatient = (patient: PatientProcessingData) => cleanObject({
    firstName: patient.firstName?.trim(),
    lastName: patient.lastName?.trim(),
    middleName: patient.middleName?.trim(),
    birthdate: patient.birthdate,
    sex: patient.sex,
    height: patient.height ? Number(patient.height) : undefined,
    weight: patient.weight ? Number(patient.weight) : undefined
});


export const createParentInfo = (name?: string, age?: string | number, occupation?: string) => {
    const info = {
        name: name?.trim(),
        age: age ? Number(age) : undefined,
        occupation: occupation?.trim()
    };
    
    //return undefined if all fields are empty
    return Object.values(info).some(Boolean) ? cleanObject(info) : undefined;
};