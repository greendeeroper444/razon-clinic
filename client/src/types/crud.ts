import { AppointmentFormData } from "./appointment";
import { BillingFormData } from "./billing";
import { BlockedTimeSlotFormData } from "./blockedSlot";
import { InventoryItemFormData } from "./invetory";
import { MedicalRecordFormData } from "./medical";
import { PatientFormData } from "./patient";
// import { PatientFormData } from "./patient";

export type FormDataType = AppointmentFormData | PatientFormData | InventoryItemFormData | MedicalRecordFormData | BillingFormData | BlockedTimeSlotFormData;

export type OperationType = 
'update' | 'delete' | 'status' | 
'create' | 'fetch' | 'archive' | 
'unarchive' | 'archiveMultiple' | 'unarchiveMultiple' |
'restore' | null;

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