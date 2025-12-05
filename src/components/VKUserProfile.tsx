import { useState, useEffect } from 'react';
import { Group, Header, SimpleCell, Avatar, Spinner, Placeholder } from '@vkontakte/vkui';
import { getUserInfo, getUserWall, getUserGroups } from '../services/vkapi';

interface VKUserProfileProps {
  accessToken: string;
  userId: number;
}

/**
 * Пример компонента для отображения VK данных пользователя
 *
 * Использование:
 * <VKUserProfile accessToken={token} userId={vkId} />
 */
export function VKUserProfile({ accessToken, userId }: VKUserProfileProps) {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [wallCount, setWallCount] = useState<number>(0);
  const [groupsCount, setGroupsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем данные параллельно
        const [info, wall, groups] = await Promise.allSettled([
          getUserInfo(accessToken, userId),
          getUserWall(accessToken, userId, 10),
          getUserGroups(accessToken, userId),
        ]);

        if (info.status === 'fulfilled') {
          setUserInfo(info.value);
        } else {
          console.error('Failed to get user info:', info.reason);
        }

        if (wall.status === 'fulfilled') {
          setWallCount(wall.value.length);
        }

        if (groups.status === 'fulfilled') {
          setGroupsCount(groups.value.length);
        }
      } catch (err: any) {
        console.error('Error fetching VK data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, userId]);

  if (loading) {
    return (
      <Group>
        <Placeholder>
          <Spinner size="l" />
        </Placeholder>
      </Group>
    );
  }

  if (error) {
    return (
      <Group>
        <Placeholder>Ошибка загрузки данных VK: {error}</Placeholder>
      </Group>
    );
  }

  if (!userInfo) {
    return (
      <Group>
        <Placeholder>Данные пользователя не найдены</Placeholder>
      </Group>
    );
  }

  return (
    <Group header={<Header>Данные из VK</Header>}>
      <SimpleCell
        before={<Avatar size={48} src={userInfo.photo_200} />}
        subtitle={userInfo.city?.title || 'Город не указан'}
      >
        {userInfo.first_name} {userInfo.last_name}
      </SimpleCell>

      {userInfo.bdate && (
        <SimpleCell>Дата рождения: {userInfo.bdate}</SimpleCell>
      )}

      <SimpleCell>Пол: {userInfo.sex === 1 ? 'Женский' : userInfo.sex === 2 ? 'Мужской' : 'Не указан'}</SimpleCell>

      {wallCount > 0 && (
        <SimpleCell>Постов на стене: {wallCount}</SimpleCell>
      )}

      {groupsCount > 0 && (
        <SimpleCell>Состоит в группах: {groupsCount}</SimpleCell>
      )}
    </Group>
  );
}
