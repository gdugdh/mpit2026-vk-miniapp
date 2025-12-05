import axios from "axios";

const API_BASE_URL = "https://urban-match.work.gd/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  vk_id: number;
  gender: string;
  birth_date: string;
  is_verified: boolean;
  is_online: boolean;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  display_name: string;
  bio?: string;
  city?: string;
  interests?: string[];
  location_lat?: number;
  location_lon?: number;
  location_updated_at?: string;
  pref_min_age?: number;
  pref_max_age?: number;
  pref_max_distance_km?: number;
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  expires_at: string;
  user: User;
  is_new_user: boolean;
}

export interface VKParams {
  vk_user_id: string;
  vk_app_id: string;
  vk_is_app_user?: string;
  vk_are_notifications_enabled?: string;
  vk_language?: string;
  vk_platform?: string;
  vk_access_token_settings?: string;
  vk_ts?: string;
  sign: string;
  [key: string]: string | undefined;
}

export const authAPI = {
  authenticateVK: async (
    vkParams: VKParams,
    accessToken: string,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/vk", {
      vk_params: vkParams,
      access_token: accessToken,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  getMe: async (): Promise<{ user_id: number }> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

export const profileAPI = {
  getMyProfile: async (): Promise<Profile> => {
    const response = await apiClient.get("/profile/me");
    return response.data;
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await apiClient.put("/profile/me", data);
    return response.data;
  },

  completeOnboarding: async (data: {
    display_name: string;
    bio?: string;
    city?: string;
    interests?: string[];
    pref_min_age?: number;
    pref_max_age?: number;
    pref_max_distance_km?: number;
  }): Promise<Profile> => {
    const response = await apiClient.post("/profile/complete-onboarding", data);
    return response.data;
  },
};
