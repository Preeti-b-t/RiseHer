import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, EntrepreneurProfile } from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '../api';

interface AuthContextType {
  user: User | null;
  profile: EntrepreneurProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchPersona: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfileState: (p: EntrepreneurProfile) => void;
  setSession: (token: string, user: User, profile?: EntrepreneurProfile | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = async (activeToken?: string | null) => {
    const currentToken = activeToken !== undefined ? activeToken : getAuthToken();
    if (!currentToken) {
      setToken(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const currentUser = await api.getMe();
      setUser(currentUser);
      if (currentUser.role === 'entrepreneur') {
        const prof = await api.getProfile().catch(() => null);
        setProfile(prof);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err);
      clearAuthToken();
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      if (res.user.role === 'entrepreneur') {
        const prof = await api.getProfile().catch(() => null);
        setProfile(prof);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const switchPersona = async (email: string) => {
    setLoading(true);
    try {
      const res = await api.switchDemo(email);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      if (res.user.role === 'entrepreneur') {
        const prof = await api.getProfile().catch(() => null);
        setProfile(prof);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Persona switch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user && user.role === 'entrepreneur') {
      const prof = await api.getProfile().catch(() => null);
      setProfile(prof);
    }
  };

  const setProfileState = (p: EntrepreneurProfile) => {
    setProfile(p);
  };

  const setSession = async (newToken: string, newUser: User, customProfile?: EntrepreneurProfile | null) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    if (customProfile !== undefined) {
      setProfile(customProfile);
    } else if (newUser.role === 'entrepreneur') {
      const prof = await api.getProfile().catch(() => null);
      setProfile(prof);
    } else {
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, token, loading,
      login, register, logout, switchPersona,
      refreshProfile, setProfileState, setSession
    }}>
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
