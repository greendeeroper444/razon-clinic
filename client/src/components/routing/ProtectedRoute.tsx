import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthenticationStore } from '../../stores'
import { ProtectedRouteProps } from '../../types';


const ProtectedRoute = ({ 
    children, 
    requireAuth = true, 
    redirectTo,
    allowedUserTypes 
}: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthenticationStore();

    useEffect(() => {
        if (requireAuth && !isAuthenticated) {
            navigate('/login');
            return;
        }

        if (isAuthenticated && user) {
            if (allowedUserTypes && !allowedUserTypes.includes(user.userType)) {
                if (user.userType === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.userType === 'user') {
                    navigate('/user/appointments');
                }
                return;
            }

            if (window.location.pathname === '/' && !redirectTo) {
                if (user.userType === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.userType === 'user') {
                    navigate('/user/appointments');
                }
                return;
            }

            if (redirectTo) {
                navigate(redirectTo);
                return;
            }
        }
  }, [isAuthenticated, user, requireAuth, redirectTo, allowedUserTypes, navigate]);

    if (requireAuth && !isAuthenticated) {
        return null;
    }

    if (allowedUserTypes && user && !allowedUserTypes.includes(user.userType)) {
        return null;
    }

  return children;
}

export default ProtectedRoute