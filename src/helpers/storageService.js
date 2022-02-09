import { storageFactory } from 'storage-factory';

const storageService = () => {
  return {
    local: {
      setItem: (key, value, version) => {
        const timestamp = new Date().getTime();
        storageFactory(() => localStorage).setItem(
          key,
          JSON.stringify({ value, timestamp, version })
        );
      },
      getItem: key => {
        const data = storageFactory(() => localStorage).getItem(key);
        if (data) {
          const { value, timestamp, version } = JSON.parse(data);
          return { value, timestamp, version };
        }
        return null;
      },
      key: storageFactory(() => localStorage).key,
      removeItem: storageFactory(() => localStorage).removeItem,
      clear: storageFactory(() => localStorage).clear,
      get length() {
        return storageFactory(() => localStorage).length;
      },
    },
    session: storageFactory(() => sessionStorage),
  };
};

export default storageService;
