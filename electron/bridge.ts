import { contextBridge, ipcRenderer } from 'electron';
import { SettingsState } from '../src/Settings';

export interface ApiEvents {
  message: (event: string, payload?: unknown) => void;
  ['change-state']: (state: SettingsState) => void;
}

export const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  sendMessage: (message: string) => {
    ipcRenderer.send('message', message);
  },

  changeState: (state: Partial<SettingsState>) => {
    ipcRenderer.send('change-state', state);
  },

  /**
   * Provide an easier way to listen to events
   */
  subscribe: <Type extends keyof ApiEvents>(
    channel: Type,
    callback: ApiEvents[Type]
  ) => {
    ipcRenderer.on(channel, (_, data, payload) => callback(data, payload));

    return () => {
      ipcRenderer.off(channel, (_, data, payload) => callback(data, payload));
    };
  },
};

contextBridge.exposeInMainWorld('Main', api);
