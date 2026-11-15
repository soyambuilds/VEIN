import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('vein_token'));

  useEffect(() => {
    if (!localStorage.getItem('vein_token')) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('vein_token'))
      .finally(() => setLoading(false));
  }, []);

  const finish = ({ data }) => {
    localStorage.setItem('vein_token', data.token);
    setUser(data.user);
    return data.user;
  };
  const login = (body) => api.post('/auth/login', body).then(finish);
  const register = (body) => api.post('/auth/register', body).then(finish);
  const logout = () => { localStorage.removeItem('vein_token'); setUser(null); };
  const refresh = () => api.get('/auth/me').then((r) => setUser(r.data.user));

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export const homeFor = (role) => ({ admin: '/admin', donor: '/donor', receiver: '/receiver' }[role] || '/');
