import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getProfile } from '../services'
import { User } from '../types'

interface UseAuthReturn {
    isAuthenticated: boolean;
    currentUser: User | null;
    isLoading: boolean;
    refreshAuth: () => Promise<void>;
    clearAuth: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const location = useLocation();

    const fetchProfile = async (): Promise<void> => {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const profileData = await getProfile();
                setIsAuthenticated(true);
                setCurrentUser(profileData.data.user);
            } catch (error) {
                console.error("Error fetching profile:", error);
                //token might be invalid, clear it
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
        }
        
        setIsLoading(false);
    };

    const clearAuth = (): void => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('rememberUser');
    };

    //initial auth check and refresh on location change
    useEffect(() => {
        fetchProfile();
    }, [location.pathname]);

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    refreshAuth: fetchProfile,
    clearAuth
  }
}