import { merge } from 'lodash';
import * as React from 'react';
import {
  Badges,
  getGlobalBadges,
  getSubscriberBadges,
  getUserId,
} from '../utils';
import { TwitchChat } from './TwtichChat';
import styled from 'styled-components';

// const userId = '115842730';
// const channels = ['bogush'];

export const TwitchLayout = React.memo(() => {
  const [badges, setBadges] = React.useState<Badges>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // const [{ opacity, channels }, setState] = React.useState<
  //   Pick<SettingsState, 'channels' | 'opacity'>
  // >({ channels: [''], opacity: 1 });

  const [opacity, setOpacity] = React.useState(1);
  const [channels, setChannels] = React.useState(['']);

  const onConnectedHandler = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const style = React.useMemo(() => ({ opacity }), [opacity]);

  React.useEffect(() => {
    window.Main.on('change-state', (state) => {
      setOpacity((current) => {
        if (current === state?.opacity || typeof state?.opacity !== 'number') {
          return current;
        }

        return (state?.opacity ?? 100) / 100;
      });

      setChannels((current) => {
        const newChannels = state?.channels?.[0];

        if (current[0] === newChannels || typeof newChannels !== 'string') {
          return current;
        }

        return state.channels;
      });
    });
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setError(null);
        setIsLoading(true);

        const channel = channels?.[0]?.trim();

        console.log('channel', channel);

        if (channel === '' || typeof channel !== 'string') {
          throw new Error('Введите название канала');
        }

        const userId = await getUserId(channel);

        console.log('userId', userId);

        await Promise.all([
          getGlobalBadges(),
          getSubscriberBadges(userId),
        ]).then((badges) => {
          setBadges(
            badges.reduce<Badges>(
              (accumulator, current) => merge(accumulator, current),
              { badge_sets: {} }
            )
          );
          setIsLoading(false);
        });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [channels]);

  if (error) {
    return (
      <Layout>
        <CenterContainer>{error}</CenterContainer>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <CenterContainer>
          <h1>Загрузка...</h1>
        </CenterContainer>
      </Layout>
    );
  }

  return (
    <Layout style={style}>
      <TwitchChat
        badges={badges}
        channels={channels}
        onConnect={onConnectedHandler}
      />
    </Layout>
  );
});

TwitchLayout.displayName = 'TwitchLayout';

const CenterContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  font-size: 48;
  color: white;
  align-items: center;
  justify-content: center;
`;

const Layout = styled.div`
  height: 100%;
  background-color: #18181b;
`;
