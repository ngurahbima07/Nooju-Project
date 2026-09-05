import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useAuth } from 'contexts/AuthContext';

// ==============================|| GUEST GUARD ||============================== //
// Kebalikan dari AuthGuard: kalau user sudah login, jangan biarkan buka
// halaman /login lagi - langsung lempar ke dashboard.

export default function GuestGuard({ children }) {
  const { isLoggedIn, isInitialized } = useAuth();

  if (!isInitialized) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

GuestGuard.propTypes = { children: PropTypes.node };
