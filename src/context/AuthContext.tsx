import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { apiClient } from '../services/apiClient';
import { getUserProfile, updateUserProfile, seedDemoData, getUserData } from '../services/storageService';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  switchAccount: (accountKey: 'demo-engineer' | 'demo-manager' | 'fresh-user') => Promise<void>;
  logout: () => void;
  updateCoachStyle: (style: 'socratic' | 'action-oriented' | 'empathetic') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_ACCOUNTS = {
  'demo-engineer': {
    uid: 'usr_eng_alex_chen_92',
    email: 'alex.chen@techgrowth.dev',
    displayName: 'Alex Chen',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coachStyle: 'action-oriented' as const
  },
  'demo-manager': {
    uid: 'usr_pm_sarah_lin_44',
    email: 'sarah.lin@leadershipcorp.io',
    displayName: 'Sarah Lin',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    coachStyle: 'socratic' as const
  },
  'fresh-user': {
    uid: 'usr_new_growth_user_01',
    email: 'new.member@journal.ai',
    displayName: 'Jordan Taylor',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    coachStyle: 'empathetic' as const
  }
};

const AUTH_USER_KEY = 'gemini_journal_auth_user';
const AUTH_TOKEN_KEY = 'gemini_journal_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved session on mount
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
        apiClient.setToken(savedToken);
      } catch (e) {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogle = async (customEmail?: string, customName?: string) => {
    setIsLoading(true);
    try {
      const email = customEmail || 'anuradhasaishaktimodem22@gmail.com';
      const displayName = customName || email.split('@')[0].replace(/[0-9._]/g, ' ').trim() || 'Growth Explorer';
      const uid = `usr_google_${btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
      
      const profile: UserProfile = {
        uid,
        email,
        displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0284c7,0f766e,4f46e5`,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        coachStyle: 'action-oriented'
      };

      // Request verified backend session token
      const session = await apiClient.createSession(profile);
      
      setUser(profile);
      setToken(session.sessionToken);
      apiClient.setToken(session.sessionToken);

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      localStorage.setItem(AUTH_TOKEN_KEY, session.sessionToken);

      // If user has no existing data, seed initial data for immediate discovery
      const existingData = getUserData(uid);
      if (existingData.reflections.length === 0 && existingData.goals.length === 0) {
        seedDemoData(uid, profile);
      }
    } catch (err) {
      console.error('Login error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchAccount = async (accountKey: 'demo-engineer' | 'demo-manager' | 'fresh-user') => {
    setIsLoading(true);
    try {
      const preset = PRESET_ACCOUNTS[accountKey];
      const profile: UserProfile = {
        uid: preset.uid,
        email: preset.email,
        displayName: preset.displayName,
        photoURL: preset.photoURL,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        coachStyle: preset.coachStyle
      };

      const session = await apiClient.createSession(profile);
      
      setUser(profile);
      setToken(session.sessionToken);
      apiClient.setToken(session.sessionToken);

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      localStorage.setItem(AUTH_TOKEN_KEY, session.sessionToken);

      // Seed preset if not present
      if (accountKey !== 'fresh-user') {
        const data = getUserData(preset.uid);
        if (data.reflections.length === 0) {
          seedDemoData(preset.uid, profile);
        }
      }
    } catch (e) {
      console.error('Account switch failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const updateCoachStyle = (style: 'socratic' | 'action-oriented' | 'empathetic') => {
    if (!user) return;
    const updated = updateUserProfile(user.uid, { coachStyle: style });
    setUser({ ...user, coachStyle: style });
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...user, coachStyle: style }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        loginWithGoogle,
        switchAccount,
        logout,
        updateCoachStyle
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
