import {MMKV} from 'react-native-mmkv';
import {StateStorage} from 'zustand/middleware';

const storage = new MMKV();

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: name => {
    let value = storage.getString(name);
    return value ?? null;
  },
  removeItem: name => {
    return storage.delete(name);
  },
};

function resetStorage() {
  storage.clearAll();
}

export {storage, mmkvStorage, resetStorage};
