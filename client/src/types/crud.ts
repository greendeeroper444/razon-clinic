import { AppointmentFormData } from "./appointment";
import { BillingFormData } from "./billing";
import { InventoryItemFormData } from "./invetory";
import { MedicalRecordFormData } from "./medical";
import { PersonalPatientFormData } from "./personalPatient";
// import { PatientFormData } from "./patient";

export type FormDataType = AppointmentFormData | PersonalPatientFormData | InventoryItemFormData | MedicalRecordFormData | BillingFormData;

export interface DeleteData {
    id: string;
    itemName: string;
    itemType: string;
}