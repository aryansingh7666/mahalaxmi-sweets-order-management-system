import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

const ADMIN_CREDS = { username: 'admin', password: 'mahalaxmi123' };

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('mhl_auth') === 'true';
  });

  const login = useCallback((username, password) => {
    if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
      sessionStorage.setItem('mhl_auth', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('mhl_auth');
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
