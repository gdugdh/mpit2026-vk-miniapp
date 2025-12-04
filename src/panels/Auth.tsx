import { FC, useEffect } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
  Div,
  Button,
  Spinner,
  Title,
  Text,
  NavIdProps,
} from '@vkontakte/vkui';
import { useAuth } from '../contexts/AuthContext';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';

export interface AuthProps extends NavIdProps {}

export const Auth: FC<AuthProps> = ({ id }) => {
  const { isAuthenticated, isLoading, error, login, profile } = useAuth();
  const routeNavigator = useRouteNavigator();

  useEffect(() => {
    if (isAuthenticated && profile) {
      routeNavigator.replace('/');
    }
  }, [isAuthenticated, profile, routeNavigator]);

  const handleLogin = async () => {
    await login();
  };

  return (
    <Panel id={id}>
      <PanelHeader>Вход</PanelHeader>
      <Group>
        <Div style={{ textAlign: 'center', padding: '40px 20px' }}>
          {isLoading ? (
            <>
              <Spinner size="l" />
              <Text style={{ marginTop: 20 }}>Загрузка...</Text>
            </>
          ) : (
            <>
              <Title level="1" weight="1" style={{ marginBottom: 16 }}>
                Добро пожаловать!
              </Title>
              <Text style={{ marginBottom: 32, color: 'var(--vkui--color_text_secondary)' }}>
                Войдите через VK, чтобы начать использовать приложение
              </Text>

              {error && (
                <Text style={{ color: 'var(--vkui--color_text_negative)', marginBottom: 16 }}>
                  Ошибка: {error}
                </Text>
              )}

              <Button
                size="l"
                stretched
                onClick={handleLogin}
                disabled={isLoading}
              >
                Войти через VK
              </Button>
            </>
          )}
        </Div>
      </Group>
    </Panel>
  );
};
