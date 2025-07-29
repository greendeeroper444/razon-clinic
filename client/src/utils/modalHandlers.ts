import { OpenModalWithRefreshProps } from "../types";


export const openModalWithRefresh = ({
    modalType,
    openModal,
    onRefresh,
}: OpenModalWithRefreshProps) => {
    if (openModal) {
        openModal(modalType);

        const checkForRefresh = () => {
            setTimeout(() => {
                onRefresh();
            }, 100);
            window.removeEventListener('modal-closed', checkForRefresh);
        };

        window.addEventListener('modal-closed', checkForRefresh);
    }
}
