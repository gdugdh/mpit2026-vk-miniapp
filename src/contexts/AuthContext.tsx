import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { authAPI, profileAPI, User, Profile, VKParams } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const profileData = await profileAPI.getMyProfile();
      setProfile(profileData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setProfile(null);
      } else {
        console.error('Failed to fetch profile:', err);
      }
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get VK launch params from URL query string or hash
      let searchParams = new URLSearchParams(window.location.search);

      // If no params in search, try hash
      if (!searchParams.has('vk_user_id')) {
        const hash = window.location.hash.substring(1);
        searchParams = new URLSearchParams(hash);
      }

      const vkParams: Record<string, string> = {};

      // Collect all VK params and sign
      searchParams.forEach((value, key) => {
        if (key.startsWith('vk_') || key === 'sign') {
          vkParams[key] = value;
        }
      });

      console.log('VK Params:', vkParams);
      console.log('Full URL:', window.location.href);

      // Request access token from VK Bridge
      let accessToken = '';
      try {
        const tokenData = await bridge.send('VKWebAppGetAuthToken', {
          app_id: Number(vkParams.vk_app_id) || 52962862, // Use app_id from params or fallback
          scope: 'friends,photos,status', // Request needed permissions
        });
        accessToken = tokenData.access_token;
        console.log('Access token received');
      } catch (err) {
        console.error('Failed to get access token:', err);
        throw new Error('Failed to get VK access token. Please grant permissions.');
      }

      const authResponse = await authAPI.authenticateVK(vkParams as VKParams, accessToken);

      localStorage.setItem('auth_token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));

      setUser(authResponse.user);
      setIsAuthenticated(true);

      await fetchProfile();
    } catch (err: any) {
      console.error('Authentication failed:', err);
      setError(err.response?.data?.error || err.message || 'Authentication failed');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          await fetchProfile();
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !profile) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        await fetchProfile();
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, profile]);

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
