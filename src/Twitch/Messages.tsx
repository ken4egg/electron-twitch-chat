import * as React from 'react';
import styled from 'styled-components';
import { ChatUserstate } from 'tmi.js';
import { Badges } from '../utils';
import { ChatLine } from './ChatLine';

export interface Message {
  /** Текст сообщения*/
  msg: string;
  /** Доп инфа по сообщению */
  tags: ChatUserstate;
  /** Иконки */
  badges: Badges | undefined;
}

export interface MessagesProps {
  messages: Message[];
}

export const Messages = React.memo<MessagesProps>(({ messages }) => {
  return (
    <>
      {messages.map((message) => (
        <Line key={message.tags.id}>
          <ChatLine {...message} />
        </Line>
      ))}
    </>
  );
});

Messages.displayName = 'Mssages';

const Line = styled.div`
  padding: 5px 20px;
`;
