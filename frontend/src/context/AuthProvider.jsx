import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';
import { clearSession, getToken, getUser, saveSession } from '../services/tokenStore';

export default function AuthProvider({ children }) {
  // Restore the session after a page refresh (only if a token is still stored).
  const [user, setUser] = useState(() => (getToken() ? getUser() : null));

  const login = useCallback(async (email, password) => {
    const { data } = await api.login(email, password);
    saveSession(data.token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
