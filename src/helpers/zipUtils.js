import { loadAsync } from 'jszip';
import axios from 'axios';

// TODO: UNCOMMENT AFTER VERSION API UPDATED
// import { store } from 'App';

let source;
export const loadZip = async (url, cb, progressCb) => {
  source = axios.CancelToken.source();

  // TODO: UNCOMMENT AFTER VERSION API UPDATED
  // const { collection } = store.getState();
  // const versionId = collection.get('currentVersion');
  // if (versionId) {
  //   url = `${url}?versionId=${versionId}`;
  // }

  try {
    const { data: bin } = await axios({
      method: 'GET',
      url: url,
      responseType: 'blob',
      onDownloadProgress(progressEvent) {
        const { loaded, total } = progressEvent;
        progressCb(loaded, total);
      },
    });

    const zipContent = await loadAsync(bin);
    console.log('Zip download complete! Extracting files...');

    zipContent.remove('__MACOSX');
    cb(zipContent);
  } catch (err) {
    if (axios.isCancel(err)) {
      console.log('Error: ', err.message);
    }
  }
};

export const cancelZip = () => {
  source.cancel('Zip download is being canceled');
};
