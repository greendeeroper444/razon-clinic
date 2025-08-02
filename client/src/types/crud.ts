import { AppointmentFormData } from "./appointment";
import { BillingFormData } from "./billing";
import { InventoryItemFormData } from "./invetory";
import { MedicalRecordFormData } from "./medical";
import { PatientFormData } from "./patient";
// import { PatientFormData } from "./patient";

export type FormDataType = AppointmentFormData | PatientFormData | InventoryItemFormData | MedicalRecordFormData | BillingFormData;

export type OperationType = 'update' | 'delete' | 'status' | 'create' | 'fetch' | null;

export interface DeleteData {
    id: string;
    itemName: string;
    itemType: string;
}

export interface DeleteFormProps {
    itemName: string;
    itemType: string;
    onCancel: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
}