import { useState, useEffect } from 'react';
import { getUserInfo, getUserWall, getUserGroups, getUserFriends } from '../services/vkapi';

/**
 * Hook to fetch VK user data
 * Usage:
 * const { userInfo, wall, groups, loading, error } = useVKData(accessToken, userId);
 */
export function useVKData(accessToken: string | null, userId: number | null) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [wall, setWall] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !userId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [userInfoData, wallData, groupsData, friendsData] = await Promise.allSettled([
          getUserInfo(accessToken, userId),
          getUserWall(accessToken, userId, 10),
          getUserGroups(accessToken, userId),
          getUserFriends(accessToken, userId),
        ]);

        if (userInfoData.status === 'fulfilled') {
          setUserInfo(userInfoData.value);
        }
        if (wallData.status === 'fulfilled') {
          setWall(wallData.value);
        }
        if (groupsData.status === 'fulfilled') {
          setGroups(groupsData.value);
        }
        if (friendsData.status === 'fulfilled') {
          setFriends(friendsData.value);
        }
      } catch (err: any) {
        console.error('Failed to fetch VK data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, userId]);

  return {
    userInfo,
    wall,
    groups,
    friends,
    loading,
    error,
  };
}
