import * as React from 'react';
import styled from 'styled-components';
import { Client } from 'tmi.js';
import { Badges } from '../utils';
import { Message, Messages } from './Messages';

export const TwitchChat = React.memo<{
  badges: Badges | undefined;
  channels: string[];
  onConnect?: () => void;
}>(({ badges, channels, onConnect }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [messages, setMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages]);

  // Запретил скролить везде
  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listener = (event: any) => event.preventDefault();

    window.addEventListener('wheel', listener, { passive: false });
    return () => {
      window.removeEventListener('wheel', listener);
    };
  }, []);

  const addMessage = React.useCallback((msg: Message) => {
    setMessages((current) => {
      return [...current.slice(-50), msg];
    });
  }, []);

  React.useEffect(() => {
    const client = Client({
      connection: {
        reconnect: true,
        secure: true,
      },
      channels: [...channels],
    });

    console.log('render!!!');

    client
      .connect()
      .then(() => {
        onConnect?.();
        console.log('connected');
      })
      .catch((e) => {
        console.error('connect error', e);
      });

    client.on('message', (_, tags, msg, self) => {
      if (self) {
        return;
      }

      addMessage({ badges, msg, tags });
    });

    return () => {
      client.removeAllListeners();
      client.disconnect();
      setMessages([]);
    };
  }, [addMessage, badges, channels, onConnect]);

  return (
    <Container ref={ref}>
      <Messages messages={messages} />
    </Container>
  );
});

const Container = styled.div`
  color: white;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  font-family: Inter;
  overflow-y: scroll;
  height: 100%;

  ::-webkit-scrollbar {
    display: none;
  }
`;
