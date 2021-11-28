/* eslint-disable react/display-name */
import * as React from 'react';
import styled from 'styled-components';
import { ChatUserstate } from 'tmi.js';
import {
  BadgeResponse,
  Badges,
  getTwitchEmoticonsArray,
  has,
  processString,
} from '../utils';
import { getHexContrast, increaseBrightness } from './colorUtils';

const defaultChatColors = [
  '#e05b5b',
  '#ff7f50',
  '#00FF00',
  '#B22222',
  '#9ACD32',
  '#FF4500',
  '#2E8B57',
  '#DAA520',
  '#D2691E',
  '#5F9EA0',
  '#1E90FF',
  '#FF69B4',
  '#8A2BE2',
  '#00FF7F',
];

const escapeRegEx = /[-[\]{}()*+?.,\\^$|#\s]/g;

const defaultColor =
  defaultChatColors[Math.floor(Math.random() * defaultChatColors.length)];

export const ChatLine = React.memo<{
  badges: Badges | undefined;
  tags: ChatUserstate;
  msg: string;
}>(
  ({
    badges,
    tags: {
      badges: tagBadges,
      color,
      ['display-name']: displayName,
      emotes,
      ...tags
    },
    msg: msgRaw,
  }) => {
    const badgeSets = badges?.badge_sets;
    const userBadges = React.useMemo(
      () =>
        Object.keys(tagBadges ?? {}).reduce<BadgeResponse[]>(
          (accumulator, current) => {
            const version = tagBadges?.[current];

            const badge = version && badgeSets?.[current].versions[version];
            if (badge) {
              accumulator.push(badge);
            }

            return accumulator;
          },
          []
        ),
      [badgeSets, tagBadges]
    );

    const twitchEmotesReplacer = getTwitchEmoticonsArray(msgRaw, emotes).map(
      (item) => ({
        regex: new RegExp(item.stringToReplace.replace(escapeRegEx, '\\$&')),
        fn: (key: number) => (
          <div
            style={{
              width: '28px',
              height: '28px',
              verticalAlign: 'middle',
              display: 'inline-block',
            }}
          >
            <img
              key={key}
              style={{
                verticalAlign: 'middle',
                maxWidth: '28px',
                maxHeight: '28px',
                margin: '-5px 0',
              }}
              src={item.replacement}
            />
          </div>
        ),
      })
    );

    const linkReplacer = {
      regex:
        /https?:\/\/[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&//=]*/g,
      fn: (key: number, result: string[]) => (
        <Link
          target="_blank"
          key={`link-${key}`}
          rel="noreferrer"
          href={result[0]}
        >
          {result[0]}
        </Link>
      ),
    };

    console.log('tags', tags, 'msg', msgRaw);

    const isReply = isTagsHasReply(tags);

    /**
     * Если приходит тег ответа, нужно удалить обращение в начале + 2 символа
     * "@Ken4egg Привет!" -> "Привет!"
     */
    const msg = isReply
      ? msgRaw.slice(tags['reply-parent-display-name'].length + 2)
      : msgRaw;

    const textFragment = processString([...twitchEmotesReplacer, linkReplacer])(
      msg
    );

    const contrast = getHexContrast('#18181b', color || defaultColor);

    return (
      <>
        {isReply && (
          <AsnwerContainer>
            <Figure>{twitchIcon}</Figure>
            <AnswerCaption>
              В ответ {tags['reply-parent-display-name']}:{' '}
              {tags['reply-parent-msg-body']}
            </AnswerCaption>
          </AsnwerContainer>
        )}
        {userBadges.map((badge, index) => {
          return (
            <img
              style={{ verticalAlign: 'middle', marginRight: '3px' }}
              key={badge.title + index}
              src={badge.image_url_1x}
              alt={badge.description}
            />
          );
        })}
        {/* {color && (
          <span style={{ color: increaseBrightness(color, 50) }}>test</span>
        )} */}
        <DisplayName color={color} contrast={contrast}>
          {displayName}
        </DisplayName>
        :{' '}
        <TextFragment isHighlighted={isHighlighted(tags)}>
          {textFragment}
        </TextFragment>
      </>
    );
  }
);

ChatLine.displayName = 'ChatLine';

const isTagsHasReply = (
  o: ChatUserstate
): o is ChatUserstate & {
  'reply-parent-msg-body': string;
  'reply-parent-display-name': string;
} => {
  return (
    has(o, 'reply-parent-msg-body') &&
    typeof o['reply-parent-msg-body'] === 'string' &&
    has(o, 'reply-parent-display-name') &&
    typeof o['reply-parent-display-name'] === 'string'
  );
};

const isHighlighted = (
  o: ChatUserstate
): o is ChatUserstate & { ['msg-id']: 'highlighted-message' } => {
  return has(o, 'msg-id') && o['msg-id'] === 'highlighted-message';
};

const TextFragment = styled.span<{ isHighlighted?: boolean }>(
  ({ isHighlighted }) =>
    isHighlighted && `background: #755ebc;border: 4px solid #755ebc;`
);

const DisplayName = styled.span<{ color?: string; contrast: number }>`
  color: ${(props) => {
    const color = props.color || defaultColor;
    if (props.contrast < 3) {
      return increaseBrightness(color, 47);
    }

    return color;
  }};

  font-weight: 700;
`;

const AsnwerContainer = styled.div`
  font-size: 12px;
  color: #adadb8;
  fill: #adadb8;
  display: flex;
`;

const Figure = styled.figure`
  display: inline-flex;
  align-items: center;
`;

const AnswerCaption = styled.span`
  padding-left: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Link = styled.a`
  color: #bf94ff;
  text-decoration: none;
`;

const twitchIcon = (
  <svg
    type="color-fill-current"
    width="17px"
    height="17px"
    version="1.1"
    viewBox="0 0 16 16"
    x="0px"
    y="0px"
  >
    <g>
      <path d="M5 6H7V8H5V6Z"></path>
      <path d="M9 6H11V8H9V6Z"></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 14L10 12H13C13.5523 12 14 11.5523 14 11V3C14 2.44772 13.5523 2 13 2H3C2.44772 2 2 2.44772 2 3V11C2 11.5523 2.44772 12 3 12H6L8 14ZM6.82843 10H4V4H12V10H9.17157L8 11.1716L6.82843 10Z"
      ></path>
    </g>
  </svg>
);
