import { useEffect, useState } from 'react'
import styles from './NavigationComponent.module.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import rpcLogo from '../../assets/icons/rpc-logo.png';
import { User } from '../../types/auth';
import { logoutUser } from '../../pages/services/authService';
import { toast } from 'sonner';


const NavigationComponent = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        //check if user is authenticated
        const token = localStorage.getItem('token');
        const userDataString = localStorage.getItem('userData');
        
        if (token && userDataString) {
            try {
                const userData = JSON.parse(userDataString) as User;
                setIsAuthenticated(true);
                setCurrentUser(userData);
            } catch (error) {
                //handle invalid JSON
                console.error("Error parsing user data:", error);
                //clear invalid data
                localStorage.removeItem('userData');
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
    }, [location.pathname]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const isActive = (path: string): boolean => {
        return location.pathname === path;
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            
            //remove token and user data from local storage
            localStorage.removeItem('token');
            localStorage.removeItem('rememberUser');
            
            //show success toast
            toast.success('Successfully logged out');
            
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
                    <Link to='/about' className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}>About</Link>
                    <Link to='/services' className={`${styles.navLink} ${isActive('/services') ? styles.active : ''}`}>Services</Link>
                    <Link to='/contact' className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}>Contact</Link>
                    {
                        isAuthenticated && (
                            <Link to='/user/appointments' className={`${styles.navLink} ${isActive('/user/appointments') ? styles.active : ''}`}>Appointment</Link>
                        )
                    }
                </div>
                
                <div className={styles.authLinks}>
                    {
                        isAuthenticated ? (
                            //show logout when authenticated
                            <>
                                <div>
                                    <span>{currentUser?.fullName}</span>
                                </div>
                                |
                                <button 
                                    type='submit'
                                    onClick={handleLogout}
                                    className={styles.logoutButton}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className={styles.authIcon} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            //show login and signup when not authenticated
                            <>
                                <Link to='/login' className={`${styles.loginLink} ${isActive('/login') ? styles.active : ''}`}>
                                    <FontAwesomeIcon icon={faUser} className={styles.authIcon} />
                                    Login
                                </Link>
                                <Link to='/signup' className={`${styles.signupLink} ${isActive('/signup') ? styles.active : ''}`}>Sign Up</Link>
                            </>
                        )
                    }
                </div>
            </div>
            
            <button type='submit' className={styles.menuToggle} onClick={toggleMenu} aria-label='Toggle menu'>
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
            
            {/*mobile menu overlay */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.active : ''}`}>
                <div className={styles.mobileNavLinks}>
                    <Link to='/' 
                        className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
                        onClick={toggleMenu}>
                        Home
                    </Link>
                    <Link to='/about' 
                        className={`${styles.navLink} ${isActive('/about') ? styles.active : ''}`}
                        onClick={toggleMenu}>
                        About
                    </Link>
                    <Link to='/services' 
                        className={`${styles.navLink} ${isActive('/services') ? styles.active : ''}`}
                        onClick={toggleMenu}>
                        Services
                    </Link>
                    <Link to='/contact' 
                        className={`${styles.navLink} ${isActive('/contact') ? styles.active : ''}`}
                        onClick={toggleMenu}>
                        Contact
                    </Link>
                    {
                        isAuthenticated && (
                            <Link to='/user/appointments' 
                                className={`${styles.navLink} ${isActive('/user/appointments') ? styles.active : ''}`}
                                onClick={toggleMenu}>
                                Appointment
                            </Link>
                        )
                    }
                </div>
                
                <div className={styles.mobileAuthLinks}>
                    {
                        isAuthenticated ? (
                            //show logout when authenticated
                              <>
                                <div>
                                    <span>{currentUser?.fullName}</span>
                                </div>
                                <button 
                                    type='submit'
                                    onClick={handleLogout}
                                    className={styles.logoutButton}
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className={styles.authIcon} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            // show login and signup when not authenticated
                            <>
                                <Link to='/login' 
                                    className={`${styles.loginLink} ${isActive('/login') ? styles.active : ''}`}
                                    onClick={toggleMenu}>
                                    <FontAwesomeIcon icon={faUser} className={styles.authIcon} />
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

export default NavigationComponent