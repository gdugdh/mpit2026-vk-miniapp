import { FC, useEffect } from "react";
import {
  Panel,
  PanelHeader,
  Header,
  Button,
  Group,
  Cell,
  Div,
  Avatar,
  NavIdProps,
  Spinner,
  Text,
} from "@vkontakte/vkui";
import { UserInfo } from "@vkontakte/vk-bridge";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { useAuth } from "../contexts/AuthContext";

export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser }) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const { isAuthenticated, profile, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      routeNavigator.replace('/auth');
    }
  }, [isAuthenticated, isLoading, routeNavigator]);

  if (isLoading) {
    return (
      <Panel id={id}>
        <PanelHeader>Главная</PanelHeader>
        <Group>
          <Div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Spinner size="l" />
            <Text style={{ marginTop: 20 }}>Загрузка...</Text>
          </Div>
        </Group>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>

      {profile && (
        <Group header={<Header size="s">Профиль пользователя</Header>}>
          <Cell
            before={photo_200 && <Avatar src={photo_200} />}
            subtitle={profile.city || city?.title}
          >
            {profile.display_name || `${first_name} ${last_name}`}
          </Cell>
          {profile.bio && (
            <Cell multiline>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                {profile.bio}
              </Text>
            </Cell>
          )}
          {profile.interests && profile.interests.length > 0 && (
            <Cell multiline>
              <Text weight="2">Интересы:</Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                {profile.interests.join(', ')}
              </Text>
            </Cell>
          )}
        </Group>
      )}

      {fetchedUser && (
        <Group
          header={<Header size="s">User Data Fetched with VK Bridge</Header>}
        >
          <Cell
            before={photo_200 && <Avatar src={photo_200} />}
            subtitle={city?.title}
          >
            {`${first_name} ${last_name}`}
          </Cell>
        </Group>
      )}

      <Group header={<Header size="s">Navigation Example</Header>}>
        <Div>
          <Button
            stretched
            size="l"
            mode="secondary"
            onClick={() => routeNavigator.push("persik")}
          >
            Показать котэ
          </Button>
        </Div>
      </Group>

      <Group>
        <Div>
          <Button
            stretched
            size="l"
            mode="secondary"
            appearance="negative"
            onClick={logout}
          >
            Выйти
          </Button>
        </Div>
      </Group>
    </Panel>
  );
};
