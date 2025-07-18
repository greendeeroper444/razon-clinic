import { createContext, useContext } from 'react';
import { ModalType } from '../types';

export interface ModalContextType {
    openModal: (type: ModalType) => void;
}

export interface OpenModalProps {
    openModal: (type: ModalType) => void;
}

//modal context with proper typing
export const ModalContext = createContext<ModalContextType | undefined>(undefined);

//hook for accessing the modal context
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};