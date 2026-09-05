import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import api, { TOKEN_STORAGE_KEY } from 'api/axios';

const AuthContext = createContext(null);

// ==============================|| AUTH CONTEXT ||============================== //
// Menyimpan status login (Bearer token dari Laravel Sanctum) dan menyediakan
// login()/logout() untuk dipakai di seluruh aplikasi.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      setIsInitialized(true);
      return;
    }

    // Validasi token yang tersimpan ke backend saat aplikasi pertama dibuka.
    api
      .get('/me')
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => {
        setIsInitialized(true);
      });
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    window.localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Token mungkin sudah kadaluarsa di server; sesi lokal tetap dihapus.
    } finally {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: Boolean(user),
      isInitialized,
      login,
      logout
    }),
    [user, isInitialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() harus dipakai di dalam <AuthProvider>');
  }
  return context;
}

export default AuthContext;
