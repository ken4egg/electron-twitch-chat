/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as React from 'react';
import { ChatUserstate } from 'tmi.js';

// TODO разобрать тут хлам

/**
 * Проверяет, является ли указанное свойство собственным свойством объекта
 */
export function has<N extends string>(
  obj: unknown,
  propertyName: N
): obj is {
  [K in N]: unknown;
} {
  return (
    Object(obj) === obj &&
    Object.prototype.hasOwnProperty.call(obj, propertyName)
  );
}

export interface ProcessStringOptions {
  regex: RegExp;
  fn: (key: number, result: string[]) => React.ReactNode;
}

export type ProcessStringFn = (
  key: number,
  result: string[]
) => React.ReactNode;

export const processString = (options: ProcessStringOptions[]) => {
  let key = 0;

  const processInputWithRegex = (
    option: ProcessStringOptions,
    input: string | string[] | React.ReactElement
  ): React.ReactNode | string => {
    if (!option.fn || typeof option.fn !== 'function') {
      throw new Error('Wrong fn in processString');
    }

    if (!option.regex || !(option.regex instanceof RegExp)) {
      throw new Error('Wrong regex in processString');
    }

    if (typeof input === 'string') {
      const regex = option.regex;
      let result = null;
      const output: React.ReactNode[] = [];

      while ((result = regex.exec(input)) !== null) {
        const index = result.index;
        const match = result[0];

        output.push(input.substring(0, index));
        output.push(option.fn(++key, result));

        input = input.substring(index + match.length, input.length + 1);
        regex.lastIndex = 0;
      }

      if (input !== '') {
        output.push(input);
      }

      return output;
    } else if (Array.isArray(input)) {
      return input.map((chunk) => processInputWithRegex(option, chunk));
    } else {
      return input;
    }
  };

  return (input: any): React.ReactNode[] | string => {
    if (!options || !Array.isArray(options) || !options.length) {
      return input;
    }

    options.forEach((option) => {
      input = processInputWithRegex(option, input);
    });

    return input;
  };
};

export const getTwitchEmoticonsArray = (
  msg: string,
  emotes: ChatUserstate['emotes']
) => {
  const stringReplacements: { stringToReplace: string; replacement: string }[] =
    [];

  Object.entries(emotes ?? {}).forEach(([id, positions]) => {
    const [position] = positions;
    const [start, end] = position.split('-');

    const stringToReplace = msg.substring(Number(start), Number(end) + 1);

    stringReplacements.push({
      stringToReplace: stringToReplace,
      replacement: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/4.0`,
    });
  });

  return stringReplacements;
};

/* eslint-disable camelcase */
export interface BadgeResponse {
  image_url_1x: string;
  image_url_2x: string;
  image_url_4x: string;
  description: string;
  title: string;
  click_action: string;
  click_url: string;
  last_updated: null;
}

export interface Badges {
  badge_sets: {
    [key: string]: {
      versions: {
        [key: string]: BadgeResponse;
      };
    };
  };
}

const empty = { badge_sets: {} };

export const getSubscriberBadges = async (userId: string): Promise<Badges> => {
  try {
    return fetch(
      `https://badges.twitch.tv/v1/badges/channels/${userId}/display`
    ).then((res) => res.json());
  } catch {
    return empty;
  }
};

export const getGlobalBadges = async (): Promise<Badges> => {
  try {
    return fetch('https://badges.twitch.tv/v1/badges/global/display').then(
      (res) => res.json()
    );
  } catch {
    return empty;
  }
};

export const getUserId = async (channelLogin: string) => {
  return fetch('https://gql.twitch.tv/gql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Client-Id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
    },
    body: `[{"operationName":"ChannelVideoShelvesQuery","variables":{"channelLogin":"${channelLogin}","first":1},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"fb663273aa958ebe2f58d5fcb3aacc112d67ebfd7f414b095c5d1498d21aad92"}}}]`,
  }).then(async (r) => {
    const data = await r.json();
    console.log('data', data);
    if (isLastBroadcastResponse(data)) {
      return data[0].data.user.id;
    }

    throw new Error(`Не удалось получить id юзера по каналу "${channelLogin}"`);
  });
};

interface GetLastBroadcastResponse {
  data: {
    user: {
      id: string;
    };
  };
}

export const isLastBroadcastResponse = (
  obj: unknown
): obj is GetLastBroadcastResponse[] => {
  const first = Array.isArray(obj) && obj[0];

  return (
    first &&
    has(first, 'data') &&
    has(first.data, 'user') &&
    has(first.data.user, 'id') &&
    typeof first.data.user.id === 'string'
  );
};
