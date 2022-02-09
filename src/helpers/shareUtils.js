import { store } from 'App';
import config from 'config';

// generate unique base64 code for share image url
export const uniqueCode = () => {
  const { collection } = store.getState();
  const currentImagesMap = collection.get('currentImagesMap').toJSON();
  Object.entries(currentImagesMap).forEach(([k, v]) => {
    currentImagesMap[k] = v.split('/').slice(-1);
  });
  return Buffer.from(JSON.stringify(currentImagesMap)).toString('base64');
};

export const extractObjectFromBase64 = (string, currentId) => {
  const currentImagesMap = JSON.parse(Buffer.from(string, 'base64').toString());
  Object.entries(currentImagesMap).forEach(([k, v]) => {
    currentImagesMap[k] = `${config.s3BucketUrl}/render_360/${currentId}/${v}`;
  });

  return currentImagesMap;
};

// used to get domain url
const getDomainURI = () => {
  const isInIframe = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  };

  if (isInIframe()) {
    const referrer = document.referrer.replace(/\/?$/, '/');

    if (referrer.includes('bedbath') || referrer.includes('bbbyapp')) {
      return `${referrer}store/static/3dtooliframeopenhouse`;
    }

    return referrer;
  }
  return window.location.href;
};

export const getShareUrl = () => {
  const { collection } = store.getState();
  const collectionNumber = collection.get('currentId');

  const encryptedCode = uniqueCode();
  const domainUri = getDomainURI();

  return `${domainUri}?roomId=${collectionNumber}&hex=${encryptedCode}`;
};

export const copyUrlToClipboard = () => {
  const urlToShare = getShareUrl();
  const urlTextElement = document.createElement('textarea');
  urlTextElement.value = urlToShare;
  document.body.appendChild(urlTextElement);
  urlTextElement.select();
  document.execCommand('copy');
  document.body.removeChild(urlTextElement);
};
