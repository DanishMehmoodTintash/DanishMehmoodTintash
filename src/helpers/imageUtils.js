import { List } from 'immutable';

import { store } from 'App';

import config from 'config';
import constants from 'appConstants';

import {
  setCurrentPanorama,
  getImagesFromHashMap,
  addToMergedImagesMap,
} from 'actions/collection';
import { addImageToHashMap } from 'actions/experience';

import axios from './apiService';

const isCategoryLoadingInProgress = false;
let loadNextBackgroundImage = null;

export const getMergeHashKey = array => {
  return array.filter(i => !!i).join('');
};

export const mergeImages = (sources, canvas, options) => {
  sources = sources || [];
  options = options || {};

  const defaultOptions = {
    format: 'image/png',
    quality: 0.92,
    width: undefined,
    height: undefined,
    crossOrigin: true,
    cacheElement: undefined,
    itemIndex: null,
    postItemsCanvas: null,
  };

  return new Promise(function (resolve) {
    options = { ...defaultOptions, ...options };

    // Load sources
    const images = sources.map(function (source) {
      return new Promise(function (resolve) {
        if (!source) resolve(null);
        // Convert sources to objects
        if (source.constructor.name !== 'Object') {
          source = { src: source };
        }

        // Resolve source and img when loaded
        const img = new Image();
        img.crossOrigin = true;
        img.onerror = function () {
          return resolve(null);
        };
        img.onload = function () {
          return resolve({ ...source, img: img });
        };
        img.src = source.src;

        if (options.cacheElement) options.cacheElement.appendChild(img);
      });
    });

    // Get canvas context
    const ctx = canvas.getContext('2d');

    // When sources have loaded
    resolve(
      Promise.all(images)
        .then(function (images) {
          let unchangedImagesPre = [...images];
          let unchangedImagesPost = [];
          let changedImage = null;
          let canvasPost = null;

          if (options.itemIndex) {
            unchangedImagesPre = images.slice(0, options.itemIndex);
            unchangedImagesPost = images.slice(options.itemIndex + 1);
            changedImage = images[options.itemIndex];
            canvasPost = options.postItemsCanvas || document.createElement('canvas');
          }

          unchangedImagesPre = unchangedImagesPre.filter(img => !!img);
          unchangedImagesPost = unchangedImagesPost.filter(img => !!img);

          // Set canvas dimensions
          const getSize = function (dim) {
            return (
              options[dim] ||
              Math.max(
                ...images.filter(image => !!image).map(image => image.img[dim] || 0)
              )
            );
          };
          canvas.width = getSize('width');
          canvas.height = getSize('height');

          // Draw pre images to canvas
          unchangedImagesPre.forEach(function (image) {
            ctx.globalAlpha = image.opacity ? image.opacity : 1;
            return ctx.drawImage(image.img, image.x || 0, image.y || 0);
          });

          let finalB64;
          let unchangedB64Pre;
          let unchangedB64Post;
          if (unchangedImagesPre.length > 1) {
            unchangedB64Pre = canvas.toDataURL(options.format, options.quality);
          } else {
            unchangedB64Pre = unchangedImagesPre[0].img.src;
          }

          // Draw post images to canvas
          if (canvasPost) {
            canvasPost.width = canvas.width;
            canvasPost.height = canvas.height;

            const ctxPost = canvasPost.getContext('2d');
            unchangedImagesPost.forEach(function (image) {
              ctxPost.globalAlpha = image.opacity ? image.opacity : 1;
              return ctxPost.drawImage(image.img, image.x || 0, image.y || 0);
            });

            if (unchangedImagesPost.length > 1) {
              unchangedB64Post = canvasPost.toDataURL(options.format, options.quality);
            } else if (unchangedImagesPost.length) {
              unchangedB64Post = unchangedImagesPost[0].img.src;
            }
          }

          if (options.itemIndex) {
            if (changedImage) {
              ctx.globalAlpha = changedImage.opacity ? changedImage.opacity : 1;
              ctx.drawImage(changedImage.img, changedImage.x || 0, changedImage.y || 0);
            }

            if (unchangedB64Post) {
              ctx.drawImage(options.postItemsCanvas, 0, 0);
            }

            finalB64 = canvas.toDataURL(options.format, options.quality);
          } else {
            finalB64 = unchangedB64Pre;
          }

          return {
            completeImage: finalB64,
            unchangedImagePre: unchangedB64Pre,
            unchangedImagePost: unchangedB64Post,
          };
        })
        .catch(function (err) {
          console.log(err.message);
        })
    );
  });
};

export const loadSelectedItemsPanorama = async () => {
  const { dispatch } = store;
  const { collection, experience } = store.getState();

  const currentImagesMap = collection.get('currentImagesMap');
  const sortingOrder = collection.getIn(['currentConfig', 'sortingOrder']);
  const currentCategory = collection.get('currentCategory');
  const mergedImagesHashMap = collection.get('mergedImagesHashMap');
  const canvasRefs = experience.get('canvasRefs');

  const currentImagesList = sortingOrder.map(category => currentImagesMap.get(category));

  const currentImagesWithBase = [collection.get('baseImage'), ...currentImagesList];
  let changedItemIndex = sortingOrder.indexOf(currentCategory);

  if (changedItemIndex !== -1) {
    changedItemIndex += 1;
  } else {
    changedItemIndex += Number.POSITIVE_INFINITY;
  }

  const unchangedImagesPre = currentImagesWithBase.slice(0, changedItemIndex);
  const unchangedImagesPost = currentImagesWithBase.slice(changedItemIndex + 1);

  const changedImage = collection.getIn(['currentImagesMap', currentCategory]);

  const options = {
    postItemsCanvas: canvasRefs.get('post'),
  };

  let imagesToBeMerged = [];
  const completeHashKey = getMergeHashKey(currentImagesWithBase);
  const unchangedHashKeyPre = getMergeHashKey(unchangedImagesPre);
  const unchangedHashKeyPost = getMergeHashKey(unchangedImagesPost);

  if (mergedImagesHashMap.has(completeHashKey)) {
    return dispatch(setCurrentPanorama(mergedImagesHashMap.get(completeHashKey)));
  }

  if (mergedImagesHashMap.has(unchangedHashKeyPre)) {
    const unchangedImagesPreB64 = mergedImagesHashMap.get(unchangedHashKeyPre);
    const [changedImageB64] = dispatch(getImagesFromHashMap([changedImage]));

    imagesToBeMerged = [unchangedImagesPreB64, changedImageB64];
    options.itemIndex = 1;

    if (mergedImagesHashMap.has(unchangedHashKeyPost)) {
      const unchangedImagesPostB64 = mergedImagesHashMap.get(unchangedHashKeyPost);
      imagesToBeMerged = [...imagesToBeMerged, unchangedImagesPostB64];
    } else {
      imagesToBeMerged = [
        ...imagesToBeMerged,
        ...dispatch(getImagesFromHashMap(unchangedImagesPost)),
      ];
    }
  } else {
    imagesToBeMerged = dispatch(getImagesFromHashMap(currentImagesWithBase));
    options.itemIndex = changedItemIndex;
  }

  const { completeImage, unchangedImagePre, unchangedImagePost } = await mergeImages(
    imagesToBeMerged,
    canvasRefs.get('default'),
    options
  );

  dispatch(addToMergedImagesMap(completeImage, completeHashKey));
  if (unchangedImagePre) {
    dispatch(addToMergedImagesMap(unchangedImagePre, unchangedHashKeyPre));
  }
  if (unchangedImagePost) {
    dispatch(addToMergedImagesMap(unchangedImagePost, unchangedHashKeyPost));
  }

  return dispatch(setCurrentPanorama(completeImage));
};

export const imageXhr = async (key, imageUrl, collectionId) => {
  const { dispatch } = store;

  try {
    const { data } = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'blob',
    });

    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (key) {
          dispatch(addImageToHashMap(collectionId, key, reader.result));
        }
        resolve(reader.result);
      };
      reader.readAsDataURL(data);
    });
  } catch (err) {
    console.log(err);
  }
};

export const fetchDefaultImages = async () => {
  const { collection, experience } = store.getState();
  const currentId = collection.get('currentId');
  const hashMap = experience.get('imagesHashMap');

  const defaultCollectionRenders = constants.DEFAULT_RENDERS[currentId] || {};
  const promises = [];

  Object.values(defaultCollectionRenders).forEach(v => {
    if (hashMap.get(currentId)?.has(v)) return;

    const imageUrl = `${config.s3BucketUrl}/utils/${v}`;
    promises.push(imageXhr(v, imageUrl, currentId));
  });

  await Promise.all(promises);
};

export const fetchSlicedImages = async ({ limit, items, batchSize } = {}, progressCb) => {
  loadNextBackgroundImage = null;

  limit = limit || 5;
  batchSize = batchSize || 4;

  const { collection, experience } = store.getState();
  const itemsData = collection.get('itemsData');
  const collectionNumber = collection.get('currentId');
  const hashMap = experience.get('imagesHashMap');

  let remainingImages = [];

  if (items) {
    if (List.isList(items)) {
      const [...itemsList] = items.values();

      const rem = itemsList
        .map(item => item.get('render'))
        .filter(image => !!image && !hashMap.get(collectionNumber)?.has(image));

      remainingImages.push(...rem);
    }
  } else if (itemsData) {
    const [...itemsLists] = itemsData.values();
    itemsLists.forEach(v => {
      if (List.isList(v)) {
        const itemsList = limit ? v.take(limit) : v;
        const rem = itemsList
          .map(item => item.get('render'))
          .filter(image => !!image && !hashMap.get(collectionNumber)?.has(image));

        remainingImages.push(...rem);
      }
    });
  }

  let pendingRequestPromises = [];
  let completedCount = 0;
  const loadImageData = async image => {
    if (hashMap.get(collectionNumber)?.has(image)) return;

    const imageUrl = `${config.s3BucketUrl}/render_360/${collectionNumber}/${image}`;
    await imageXhr(image, imageUrl, collectionNumber);
    progressCb && progressCb(completedCount++, remainingImages.length);
  };

  const scheduleImageLoad = async () => {
    let counter = 0;
    loadNextBackgroundImage = async () => {
      if (counter < remainingImages.length) {
        if (pendingRequestPromises.length < batchSize) {
          pendingRequestPromises.push(remainingImages[counter++]);
          await loadNextBackgroundImage();
        } else {
          pendingRequestPromises.push(remainingImages[counter++]);
          await Promise.all(pendingRequestPromises.map(image => loadImageData(image)));
          pendingRequestPromises = [];
          if (
            !isCategoryLoadingInProgress &&
            collectionNumber === store.getState().collection.get('currentId')
          ) {
            await loadNextBackgroundImage();
          } else if (collectionNumber !== store.getState().collection.get('currentId')) {
            pendingRequestPromises = [];
            remainingImages = [];
          }
        }
      } else if (pendingRequestPromises.length) {
        await Promise.all(pendingRequestPromises.map(image => loadImageData(image)));
      }
    };

    await loadNextBackgroundImage();
  };

  await scheduleImageLoad();
};

export const cacheImages = async images => {
  const imageMap = {};
  await Promise.any(
    images.map(async image => {
      const url = `${config.s3BucketUrl}/utils/${image}`;
      try {
        const { data } = await axios({
          method: 'GET',
          url: url,
          responseType: 'blob',
        });

        const reader = new FileReader();
        reader.onloadend = () => {
          imageMap[image] = reader.result;
        };
        reader.readAsDataURL(data);
      } catch (err) {
        console.log(err);
      }
    })
  );
  return imageMap;
};

export const imageToDataUri = (img, tWidth, tHeight, fn) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = tWidth; // target width
  canvas.height = tHeight; // target height

  const image = new Image();
  image.src = img;

  document.createElement('original').appendChild(image);
  image.onload = function () {
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // create a new base64 encoding
    const resampledImage = new Image();
    resampledImage.src = canvas.toDataURL();

    fn(resampledImage.src);
  };
};
