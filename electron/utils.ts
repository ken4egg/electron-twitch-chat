import { BrowserWindow } from 'electron';
import storage from 'electron-json-storage';
import { debounce } from 'lodash';
import { SettingsState } from '../src/Settings';

const SAVE_TIMEOUT = 5000;

export const createResizeHandle = (win: BrowserWindow, name: string) => {
  return debounce(() => {
    const bounds = win?.getBounds();

    if (bounds) {
      storage.set(name, bounds, function (error) {
        if (error) {
          throw error;
        } else {
          console.log('storage saved for', name, bounds);
        }
      });
    }
  }, SAVE_TIMEOUT);
};

export const saveStateStorage = debounce((state: SettingsState) => {
  storage.set('viewState', state, function (error) {
    if (error) {
      throw error;
    } else {
      console.log('storage saved for', 'state', state);
    }
  });
}, SAVE_TIMEOUT);
