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

      const launchParams = await bridge.send('VKWebAppGetLaunchParams');

      const vkParams: VKParams = {
        vk_user_id: launchParams.vk_user_id?.toString() || '',
        vk_app_id: launchParams.vk_app_id?.toString() || '',
        vk_is_app_user: launchParams.vk_is_app_user?.toString(),
        vk_are_notifications_enabled: launchParams.vk_are_notifications_enabled?.toString(),
        vk_language: launchParams.vk_language,
        vk_platform: launchParams.vk_platform,
        vk_access_token_settings: launchParams.vk_access_token_settings,
        sign: launchParams.sign || '',
      };

      const authResponse = await authAPI.authenticateVK(vkParams);

      localStorage.setItem('auth_token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));

      setUser(authResponse.user);
      setIsAuthenticated(true);

      await fetchProfile();
    } catch (err: any) {
      console.error('Authentication failed:', err);
      setError(err.response?.data?.error || 'Authentication failed');
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
