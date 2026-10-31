import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  loginAsRole: (targetRole: Role) => Promise<User>;
  switchRole: (newRole: Role) => Promise<User | undefined>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const storedToken = getAuthToken();
      if (storedToken) {
        const res = await api.auth.me();
        if (res && res.user) {
          setUser(res.user);
        } else {
          removeAuthToken();
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Could not fetch active session:', err);
      removeAuthToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await api.auth.login({ email, password: pass });
    setAuthToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const loginAsRole = async (targetRole: Role): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.demoLogin(targetRole);
      setAuthToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (targetRole: Role): Promise<User | undefined> => {
    return loginAsRole(targetRole);
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'citizen',
        token,
        loading,
        login,
        loginAsRole,
        switchRole,
        logout,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
