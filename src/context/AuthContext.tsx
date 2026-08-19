import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Coupon } from '../types';
import { getItem, setItem, removeItem } from '../services/storage';
import { loginRequest, signupRequest, logoutRequest, fetchMe } from '../services/api';

interface AuthContextType {
  user: User | null;
  coupons: Coupon[];
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setSession: (user: User, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [token, setToken] = useState<string | null>(() => getItem('rv_jwt_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { user: freshUser, coupons: freshCoupons } = await fetchMe();
      setUser(freshUser);
      setCoupons(freshCoupons);
    } catch (e) {
      // Token expired/invalid — drop the session.
      await removeItem('rv_jwt_token');
      setToken(null);
      setUser(null);
      setCoupons([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      await refreshMe();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const setSession = async (nextUser: User, nextToken: string) => {
    await setItem('rv_jwt_token', nextToken);
    setToken(nextToken);
    setUser(nextUser);
    await refreshMe();
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: loggedInUser, token: sessionToken } = await loginRequest(email, password);
      await setSession(loggedInUser, sessionToken);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Invalid email or password.' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { user: newUser, token: sessionToken } = await signupRequest(name, email, password);
      await setSession(newUser, sessionToken);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Could not create account.' };
    }
  };

  const logout = async () => {
    logoutRequest().catch(() => {});
    await removeItem('rv_jwt_token');
    setToken(null);
    setUser(null);
    setCoupons([]);
  };

  return (
    <AuthContext.Provider value={{ user, coupons, token, isLoading, login, signup, logout, refreshMe, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
