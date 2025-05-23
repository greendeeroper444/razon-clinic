import { AppointmentFormData } from "./appointment";
import { InventoryItemFormData } from "./invetory";
import { PersonalPatientFormData } from "./personalPatient";
// import { PatientFormData } from "./patient";

export type FormDataType = AppointmentFormData | PersonalPatientFormData | InventoryItemFormData;

export interface DeleteData {
    id: string;
    itemName: string;
    itemType: string;
}