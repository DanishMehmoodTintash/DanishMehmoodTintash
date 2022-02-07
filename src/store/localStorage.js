import storageService from 'helpers/storageService';

export const loadState = id => {
  if (!id) return undefined;

  try {
    const serializedState = storageService().local.getItem(`state_${id}`);
    if (serializedState === null) {
      return undefined;
    }
    return serializedState;
  } catch (err) {
    return undefined;
  }
};

export const saveState = (id, version, state) => {
  if (!id) return undefined;

  try {
    storageService().local.setItem(`state_${id}`, state, version);
  } catch {
    // ignore write errors
  }
};
