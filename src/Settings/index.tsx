import { debounce, merge } from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import { CheckBox } from './CheckBox';
import { Slider } from './Slider';
import { TextField } from './TextField';

export interface SettingsState {
  /** Непрозрачность число от 0 до 100 */
  opacity: number;
  /** Всегда поверх окон */
  alwaysOnTop: boolean;
  /** Канал к которому подключаемся (пока используется только channels[0]) */
  channels: string[];
}

export const defaultSettings: SettingsState = {
  opacity: 100,
  channels: [''],
  alwaysOnTop: false,
};

export const Settings = React.memo(() => {
  const [state, setState] = React.useState<SettingsState>();
  const [version, setVersion] = React.useState('');
  const [isLoadingNewVersion, setIsLoadingNewVersion] = React.useState(false);

  const { opacity = 100, alwaysOnTop = false, channels = [''] } = state || {};

  React.useEffect(() => {
    return window.Main.subscribe('message', (event, payload) => {
      if (event === 'version' && typeof payload === 'string') {
        setVersion(payload);
      }

      if (event === 'version-new') {
        setIsLoadingNewVersion(true);
      }
    });
  }, []);

  React.useEffect(() => {
    return window.Main.subscribe('change-state', (newState) => {
      if (newState && Object.keys(newState).length > 0) {
        setState(merge(defaultSettings, newState));
      }
    });
  }, []);

  const onChangeSlider = React.useCallback(
    (event: { target: HTMLInputElement }) => {
      setState((current) => {
        const newState = {
          ...(current as Omit<SettingsState, 'opacity'>),
          opacity: Number(event.target.value),
        };

        window.Main.changeState(newState);

        return newState;
      });
    },
    []
  );

  const onChangeCheckBox = React.useCallback(
    (event: { target: HTMLInputElement }) => {
      setState((current) => {
        const newState = {
          ...(current as Omit<SettingsState, 'alwaysOnTop'>),
          alwaysOnTop: event.target.checked,
        };

        window.Main.changeState(newState);

        return newState;
      });
    },
    []
  );

  const debouncedChangeState = React.useMemo(() => {
    return debounce(
      (newState: SettingsState) => window.Main.changeState(newState),
      1000,
      { leading: false }
    );
  }, []);

  const onChangeInput = React.useCallback(
    (event: { target: HTMLInputElement }) => {
      setState((current) => {
        const newState = {
          ...(current as Omit<SettingsState, 'channels'>),
          channels: [event.target.value],
        };

        debouncedChangeState(newState);

        return newState;
      });
    },
    [debouncedChangeState]
  );

  return (
    <Container>
      {/* <div style={{ margin: '0 30px' }}>
        <h2 style={{ fontWeight: 'normal' }}>Настройки</h2>
      </div> */}

      <ViewBoxGroup>
        <ViewBox>
          <ViewTitle>Название канала</ViewTitle>
          <TextField value={channels[0]} onChange={onChangeInput} />
        </ViewBox>
        <ViewBox style={{ marginTop: '25px' }}>
          <ViewTitle>
            Непрозрачность: <span>{opacity}%</span>
          </ViewTitle>
          <Slider min={0} max={100} onChange={onChangeSlider} value={opacity} />
        </ViewBox>
        <ViewBox>
          <CheckBox checked={alwaysOnTop} onChange={onChangeCheckBox}>
            Поверх всех окон
          </CheckBox>
        </ViewBox>
      </ViewBoxGroup>
      {version && <VersionFooter>Версия {version}</VersionFooter>}
      {isLoadingNewVersion && <p>Загружается новая версия...</p>}
    </Container>
  );
});

Settings.displayName = 'Settings';

const Container = styled.div`
  background: #0a0e31;
  height: 100vh;
  color: #fff;
`;

const VersionFooter = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%);
`;

const ViewBox = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  text-align: center;
  line-height: 55px;
  position: relative;
`;

const ViewBoxGroup = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ViewTitle = styled.div`
  position: absolute;
  top: -10px;
  left: 8px;
  transform: translateY(-50%);
  font-weight: 800;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  font-size: 0.65rem;
  pointer-events: none;
  user-select: none;

  & > span {
    color: white;
  }
`;
