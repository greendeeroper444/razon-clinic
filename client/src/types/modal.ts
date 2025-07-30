import { DeleteData, FormDataType } from "./crud";
import { Patient } from "./patient";

export type ModalType = 'appointment' | 'patient' | 'item' | 'medical' | 'delete' | 'status' | 'billing';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    modalType: ModalType;
    onSubmit: (data: FormDataType | string) => void | Promise<void>;
    patients?: Array<Patient>;
    editData?: FormDataType | null;
    deleteData?: DeleteData | null;
    isProcessing?: boolean;
    isRestockMode?: boolean;
    isAddQuantityMode?: boolean;
}