import { createContext, useContext, useState, useCallback } from 'react';
import { getSession, logout as logoutFn, loginUser } from '../utils/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read JWT session on mount
  const [user, setUser] = useState(() => getSession());

  const login = useCallback((email, password) => {
    const result = loginUser(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    logoutFn();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
