import { Navigate } from 'react-router-dom'
import { useAuthenticationStore } from '../../stores';
import { Layout } from '../index';
import { HomePage } from '../../pages';

const RootRedirect = () => {
    const { user, isAuthenticated } = useAuthenticationStore();

    if (isAuthenticated && user) {
        if (user.userType === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.userType === 'user') {
            return <Navigate to="/user/appointments" replace />;
        }
    }

  //if not authenticated or no user, show the homepage
  return (
    <Layout type="public" sidebarCollapsed={false} toggleSidebar={() => {}}>
      <HomePage />
    </Layout>
  )
}

export default RootRedirect