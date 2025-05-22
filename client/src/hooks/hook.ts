import { createContext, useContext } from 'react';

//import the ModalType to ensure consistency
type ModalType = 'appointment' | 'patient' | 'item';

//define types for modal context
export interface ModalContextType {
  //update to use ModalType instead of string
  openModal: (type: ModalType) => void;
}

//define props for components that might receive openModal
export interface OpenModalProps {
  //update to use ModalType instead of string
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