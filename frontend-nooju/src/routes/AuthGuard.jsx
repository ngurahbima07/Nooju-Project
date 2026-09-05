import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from 'contexts/AuthContext';

// ==============================|| AUTH GUARD ||============================== //
// Melindungi halaman dashboard: kalau belum login, lempar ke /login.
// Dipakai membungkus DashboardLayout di MainRoutes.

export default function AuthGuard({ children }) {
  const { isLoggedIn, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

AuthGuard.propTypes = { children: PropTypes.node };
