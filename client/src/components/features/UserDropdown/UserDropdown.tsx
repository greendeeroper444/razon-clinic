import { LogOut } from 'lucide-react'
import styles from './UserDropdown.module.css'

export interface UserDropdownProps {
    isVisible: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isVisible, onClose, onLogout }) => {
    if (!isVisible) return null;

    // const handleProfileClick = () => {
    //     console.log('Navigate to profile');
    //     onClose();
    // };

    const handleLogoutClick = () => {
        onLogout();
        onClose();
    };

  return (
    <div className={styles.dropdownContainer}>
        <div className={styles.dropdownMenu}>
            {/* <div className={styles.dropdownItem} onClick={handleProfileClick}>
                <User size={18} />
                <span>Profile</span>
            </div> */}
            <div className={styles.dropdownDivider}></div>
            <div className={styles.dropdownItem} onClick={handleLogoutClick}>
                <LogOut size={18} />
                <span>Logout</span>
            </div>
        </div>
    </div>
  )
}

export default UserDropdown