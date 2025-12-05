/**
 * Helper functions to fetch VK user data using access_token
 * These functions can be used after authentication to get user's wall, music, groups, etc.
 */

const VK_API_VERSION = '5.131';
const VK_API_BASE = 'https://api.vk.com/method';

interface VKAPIResponse<T> {
  response?: T;
  error?: {
    error_code: number;
    error_msg: string;
  };
}

/**
 * Fetch user information (name, photo, city, etc.)
 */
export async function getUserInfo(accessToken: string, userId: number) {
  const params = new URLSearchParams({
    user_ids: String(userId),
    fields: 'photo_200,photo_400_orig,city,bdate,sex,interests',
    access_token: accessToken,
    v: VK_API_VERSION,
  });

  const response = await fetch(`${VK_API_BASE}/users.get?${params}`);
  const data: VKAPIResponse<any[]> = await response.json();

  if (data.error) {
    throw new Error(`VK API Error: ${data.error.error_msg}`);
  }

  return data.response?.[0];
}

/**
 * Fetch user's wall posts
 */
export async function getUserWall(accessToken: string, userId: number, count = 20) {
  const params = new URLSearchParams({
    owner_id: String(userId),
    count: String(count),
    access_token: accessToken,
    v: VK_API_VERSION,
  });

  const response = await fetch(`${VK_API_BASE}/wall.get?${params}`);
  const data: VKAPIResponse<{ items: any[] }> = await response.json();

  if (data.error) {
    throw new Error(`VK API Error: ${data.error.error_msg}`);
  }

  return data.response?.items || [];
}

/**
 * Fetch user's groups
 */
export async function getUserGroups(accessToken: string, userId: number) {
  const params = new URLSearchParams({
    user_id: String(userId),
    extended: '1',
    access_token: accessToken,
    v: VK_API_VERSION,
  });

  const response = await fetch(`${VK_API_BASE}/groups.get?${params}`);
  const data: VKAPIResponse<{ items: any[] }> = await response.json();

  if (data.error) {
    throw new Error(`VK API Error: ${data.error.error_msg}`);
  }

  return data.response?.items || [];
}

/**
 * Fetch user's audio (music)
 * Note: VK restricted audio API access. This might not work for all apps.
 */
export async function getUserAudio(accessToken: string, userId: number, count = 100) {
  const params = new URLSearchParams({
    owner_id: String(userId),
    count: String(count),
    access_token: accessToken,
    v: VK_API_VERSION,
  });

  const response = await fetch(`${VK_API_BASE}/audio.get?${params}`);
  const data: VKAPIResponse<{ items: any[] }> = await response.json();

  if (data.error) {
    throw new Error(`VK API Error: ${data.error.error_msg}`);
  }

  return data.response?.items || [];
}

/**
 * Fetch user's friends
 */
export async function getUserFriends(accessToken: string, userId: number) {
  const params = new URLSearchParams({
    user_id: String(userId),
    fields: 'photo_200,city,bdate',
    access_token: accessToken,
    v: VK_API_VERSION,
  });

  const response = await fetch(`${VK_API_BASE}/friends.get?${params}`);
  const data: VKAPIResponse<{ items: any[] }> = await response.json();

  if (data.error) {
    throw new Error(`VK API Error: ${data.error.error_msg}`);
  }

  return data.response?.items || [];
}
