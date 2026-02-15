import { DeleteData, FormDataType } from "./crud";
import { Patient } from "./patient";

export type ModalType = 'appointment' | 'patient' | 'item' | 'medical' | 'delete' | 'status' | 'billing' | 'billing-details' | 'user' | 'blockedTimeSlot' | 'personnel' | 'restock' | 'addQuantity';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: ModalType;
    onSubmit: (data: FormDataType | string) => void | Promise<void>;
    patients?: Array<Patient>;
    editData?: FormDataType | null | any;
    deleteData?: DeleteData | null;
    isProcessing?: boolean;
    isRestockMode?: boolean;
    isAddQuantityMode?: boolean;
    billingId?: string
}