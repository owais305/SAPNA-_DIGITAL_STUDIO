import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem('sds_admin_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sds_admin_token');
    if (!token) {
      setReady(true);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setAdmin(res.data);
        localStorage.setItem('sds_admin_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('sds_admin_token');
        localStorage.removeItem('sds_admin_user');
        setAdmin(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('sds_admin_token', res.data.token);
    localStorage.setItem('sds_admin_user', JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = () => {
    localStorage.removeItem('sds_admin_token');
    localStorage.removeItem('sds_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
