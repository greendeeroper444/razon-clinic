import { useState } from 'react'
import styles from './Navigation.module.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, X, User } from 'lucide-react';
import rpcLogo from '../../../assets/icons/rpc-logo.png';
import { toast } from 'sonner';
import { useAuthenticationStore } from '../../../stores/authenticationStore';


const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const location = useLocation();
    const navigate = useNavigate();
    const {
        logout,
        user,
        isAuthenticated,
    } = useAuthenticationStore()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isActive = (path: string): boolean => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        try {
            logout();
        
            //redirect to login page
            navigate('/');
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to logout');
            }
        }
    };

  return (
    <nav className={styles.nav}>
        <div className={styles.navContainer}>
            <div className={styles.logoArea}>
                <img src={rpcLogo} alt="RPC Logo" />
            </div>
            
            <div className={styles.desktopMenu}>
                <div className={styles.navLinks}>
                    <Link to='/' className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>Home</Link>
                    {
                        isAuthenticated && (
                           <>
                                <Link to='/user/appointments' className={`${styles.navLink} ${isActive('/user/appointments') ? styles.active : ''}`}>Appointment</Link>
                                {/* <Link to='/user/medical-records' className={`${styles.navLink} ${isActive('/user/medical-records') ? styles.active : ''}`}>Medical Records</Link> */}
                           </>
                        )
                    }
                </div>
                
                <div className={styles.authLinks}>
                    {
                        isAuthenticated ? (
                            //show logout when authenticated
                            <>
                                <div>
                                    <span>{user?.firstName} {user?.lastName}</span>
                                </div>
                                |
                                <button 
                                    type='submit'
                                    onClick={handleLogout}
                                    className={styles.logoutButton}
                                >
                                    <LogOut size={18} className={styles.authIcon} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            //show login and signup when not authenticated
                            <>
                                <Link to='/login' className={`${styles.loginLink} ${isActive('/login') ? styles.active : ''}`}>
                                    <User size={18} className={styles.authIcon} />
                                    Login
                                </Link>
                                <Link to='/signup' className={`${styles.signupLink} ${isActive('/signup') ? styles.active : ''}`}>Sign Up</Link>
                            </>
                        )
                    }
                </div>
            </div>
            
            <button type='submit' className={styles.menuToggle} onClick={toggleMenu} aria-label='Toggle menu'>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/*mobile menu overlay */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.active : ''}`}>
                <div className={styles.mobileNavLinks}>
                    <Link to='/' 
                        className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                        onClick={toggleMenu}>
                        Home
                    </Link>
                    {
                        isAuthenticated && (
                            <>
                                <Link to='/user/appointments' 
                                    className={`${styles.navLink} ${isActive('/user/appointments') ? styles.active : ''}`}
                                    onClick={toggleMenu}
                                >
                                    Appointment
                                </Link>
                                {/* <Link to='/user/medical-records' 
                                    className={`${styles.navLink} ${isActive('/user/medical-records') ? styles.active : ''}`}
                                    onClick={toggleMenu}
                                >
                                    Medical Records
                                </Link> */}
                            </>
                        )
                    }
                </div>
                
                <div className={styles.mobileAuthLinks}>
                    {
                        isAuthenticated ? (
                            //show logout when authenticated
                              <>
                                <div>
                                    <span>{user?.firstName}</span>
                                </div>
                                <button 
                                    type='submit'
                                    onClick={handleLogout}
                                    className={styles.logoutButton}
                                >
                                    <LogOut size={18} className={styles.authIcon} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            // show login and signup when not authenticated
                            <>
                                <Link to='/login' 
                                    className={`${styles.loginLink} ${isActive('/login') ? styles.active : ''}`}
                                    onClick={toggleMenu}>
                                    <User size={18} className={styles.authIcon} />
                                    Login
                                </Link>
                                <Link to='/signup' 
                                    className={`${styles.signupLink} ${isActive('/signup') ? styles.active : ''}`}
                                    onClick={toggleMenu}>
                                    Sign Up
                                </Link>
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navigation