import { AppointmentFormData } from "./appointment";
import { InventoryItemFormData } from "./invetory";
import { PatientFormData } from "./patient";

export type FormDataType = AppointmentFormData | PatientFormData | InventoryItemFormData;

export interface DeleteData {
    id: string;
    itemName: string;
    itemType: string;
}