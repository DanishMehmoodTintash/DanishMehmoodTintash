import { OrderedMap, fromJS } from "immutable";

import constants from "appConstants";
import { initialState } from "reducers/collection";

import axios from "helpers/apiService";
import {
  loadSelectedItemsPanorama,
  fetchSlicedImages,
  fetchDefaultImages,
  imageToDataUri,
  imageXhr,
} from "helpers/imageUtils";
import storageService from "helpers/storageService";
import { applyPropertyFilters, applySortAndSearch } from "helpers/filterUtils";
import { getShareUrl, uniqueCode } from "helpers/shareUtils";
import { track, trackingProps } from "helpers/analyticsService";

import { loadState } from "store/localStorage";
import config from "config";
import {
  setOverlayLoaderState,
  setShareImage,
  resetInteraction,
  setAppLoading,
  setAppliedFiltersByCategory,
  setFilterDisclaimer,
} from "./interaction";

let isCollectionOverriden = false;

export const SET_CURRENT_COLLECTION = Symbol("SET_CURRENT_COLLECTION");
export const SET_CURATED_ROOM_ID = Symbol("SET_CURATED_ROOM_ID");
export const SET_CURRENT_COLLECTION_ID = Symbol("SET_CURRENT_COLLECTION_ID");
export const SET_CURRENT_CONFIG = Symbol("SET_CURRENT_CONFIG");
export const SET_CURRENT_VERSION = Symbol("SET_CURRENT_VERSION");
export const SET_ITEMS_DATA = Symbol("SET_ITEMS_DATA");
export const SET_FILTER_OPTIONS = Symbol("SET_FILTER_OPTIONS");
export const SET_CURRENT_CATEGORY = Symbol("SET_CURRENT_CATEGORY");
export const SET_CURRENT_ITEM = Symbol("SET_CURRENT_ITEM");
export const ADD_TO_SELECTED_ITEMS = Symbol("ADD_TO_SELECTED_ITEMS");
export const ADD_TO_CURRENT_IMAGES = Symbol("ADD_TO_CURRENT_IMAGES");
export const SET_BASE_IMAGE = Symbol("SET_BASE_IMAGE");
export const SET_CURRENT_IMAGES = Symbol("SET_CURRENT_IMAGES");
export const SET_SELECTED_ITEMS = Symbol("SET_SELECTED_ITEMS");
export const SET_CURRENT_PANORAMA = Symbol("SET_CURRENT_PANORAMA");
export const ADD_TO_MERGED_IMAGES_MAP = Symbol("ADD_TO_MERGED_IMAGES_MAP");
export const SET_FILTERED_ITEMS = Symbol("SET_FILTERED_ITEMS");
export const REMOVE_FROM_CURRENT_IMAGES = Symbol("REMOVE_FROM_CURRENT_IMAGES");
export const REMOVE_FROM_SELECTED_ITEMS = Symbol("REMOVE_FROM_SELECTED_ITEMS");
export const SET_CONNECTED_ROOMS = Symbol("SET_CONNECTED_ROOMS");
export const SET_CURATED_ROOMS = Symbol("SET_CURATED_ROOMS");

export const setFilterOptions = (options) => {
  return (dispatch, getState) => {
    const currentBrand = getState().experience.get("currentBrand");

    dispatch({
      type: SET_FILTER_OPTIONS,
      payload: options,
    });

    if (currentBrand) {
      Object.entries(options).forEach(([k, v]) => {
        if (v.brand.includes(currentBrand)) {
          dispatch(
            setAppliedFiltersByCategory({ brand: { [currentBrand]: true } }, k)
          );
          dispatch(setFilterDisclaimer("tooltip", k));
        } else {
          dispatch(setFilterDisclaimer("disclaimer", k));
        }
      });
    }
  };
};

export const setCurrentImagesMap = (map) => {
  return (dispatch) =>
    dispatch({
      type: SET_CURRENT_IMAGES,
      payload: map,
    });
};

export const setSelectedItemsMap = (map) => {
  return (dispatch) =>
    dispatch({
      type: SET_SELECTED_ITEMS,
      payload: map,
    });
};

export const setSelectedItemsAndImages = (itemsMap) => {
  return (dispatch, getState) => {
    dispatch({
      type: SET_SELECTED_ITEMS,
      payload: itemsMap,
    });

    const { collection } = getState();
    const currentId = collection.get("currentId");

    const currentImagesMap = new OrderedMap(
      itemsMap.map((v) => {
        return v
          ? `${config.s3BucketUrl}/render_360/${currentId}/${v.get("render")}`
          : "";
      })
    );

    dispatch(setCurrentImagesMap(currentImagesMap));
  };
};

export const setCurrentCuratedRoomId = (id) => {
  return (dispatch) =>
    dispatch({
      type: SET_CURATED_ROOM_ID,
      payload: id,
    });
};

export const fetchCuratedRooms = (collectionNumber) => {
  const url = `/shop_room_curated/${collectionNumber}/`;
  return async (dispatch, getState) => {
    try {
      const response = await axios.get(url);
      const { collection, experience } = getState();
      const itemsData = collection.get("itemsData");
      const [...categories] = collection
        .getIn(["currentConfig", "sortingOrder"])
        .values();

      const currentBrand = experience.get("currentBrand");

      const curatedRooms = response.data.map((room) => {
        const curatedItemsList = room.items;
        room.itemsMap = {};

        curatedItemsList.forEach((item) => {
          const itemsList = itemsData.get(item.category);
          const currentItem = itemsList.find(
            (singleItem) => singleItem.get("sku_id") === item.sku_id
          );
          room.itemsMap[item.category] = currentItem || "";
        });

        categories.forEach((category) => {
          if (!(category in room.itemsMap)) {
            room.itemsMap[category] = "";
          }
        });

        if (!isCollectionOverriden && room.brand === currentBrand) {
          const selectedItems = fromJS(room.itemsMap);
          dispatch(setCurrentCuratedRoomId(room.curated_room_id));
          dispatch(setSelectedItemsAndImages(selectedItems));
        }

        return room;
      });

      dispatch({
        type: SET_CURATED_ROOMS,
        payload: curatedRooms,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

export const fetchCollectionItemsData = (collectionNumber) => {
  const url = `/shop_room_360/${collectionNumber}/`;
  return async (dispatch) => {
    try {
      const response = await axios.get(url);

      if ("FilterOptions" in response.data) {
        const { FilterOptions } = response.data;
        dispatch(setFilterOptions(FilterOptions));

        delete response.data.FilterOptions;
      }

      dispatch({
        type: SET_ITEMS_DATA,
        payload: response.data,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

export const fetchCollectionConfig = (collectionNumber) => {
  const url = `${config.s3BucketUrl}/render_360/${collectionNumber}/roomdata.json`;
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      dispatch({
        type: SET_CURRENT_CONFIG,
        payload: response.data,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

export const fetchCollectionVersion = (collectionNumber) => {
  const url = `/room_version/${collectionNumber}/`;
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      dispatch({
        type: SET_CURRENT_VERSION,
        payload: response.data.VersionId,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

export const goToCollection = (collectionNumber, overloadState = {}) => {
  return async (dispatch) => {
    dispatch(setAppLoading(true));

    const localStateObject = loadState(collectionNumber);
    const firstVisit = storageService().session.getItem("tooltipStatus");
    const brand = storageService().session.getItem("brand");

    let persistedState = initialState;
    isCollectionOverriden = false;
    if (Object.keys(overloadState).length) {
      persistedState = persistedState.merge(overloadState);
      isCollectionOverriden = true;
    } else if (localStateObject && !(firstVisit === "true" && brand)) {
      const { value: localState } = loadState(collectionNumber);
      persistedState = persistedState.merge(localState);

      isCollectionOverriden = true;
    } else if (firstVisit === "true" && brand) {
      // TEMP(?) - clearing local storage so on every new visit, only brand associated
      // items (curated room) is applied.
      storageService().local.clear();
    }

    dispatch(resetInteraction());
    dispatch({
      type: SET_CURRENT_COLLECTION_ID,
      payload: collectionNumber,
      state: persistedState,
    });
  };
};

export const setCurrentCollection = (collectionNumber) => {
  return (dispatch, getState) => {
    const { experience, collection } = getState();
    const currentCollection = collection.get("currentCollection");
    if (currentCollection?.get("room_type_id") === collectionNumber) return;

    const allCollections = experience.get("allCollections");
    const currentRoom = allCollections.find(
      (value) => value.get("room_type_id") === collectionNumber
    );

    dispatch({
      type: SET_CURRENT_COLLECTION,
      payload: currentRoom,
    });
  };
};

export const setCurrentPanorama = (hash) => {
  return (dispatch) =>
    dispatch({
      type: SET_CURRENT_PANORAMA,
      payload: hash,
    });
};

export const setCurrentCategory = (category) => {
  return (dispatch) =>
    dispatch({
      type: SET_CURRENT_CATEGORY,
      payload: category,
    });
};

export const setFilteredItems = (items) => {
  return (dispatch) =>
    dispatch({
      type: SET_FILTERED_ITEMS,
      payload: items,
    });
};

export const loadDefaultImagesInHashMap = () => {
  return async () => fetchDefaultImages();
};

export const loadInitialImagesInHashMap = (cb) => {
  return () => fetchSlicedImages({ limit: 2, batchSize: 4 }, cb);
};

export const loadAllImagesInHashMap = () => {
  return () => fetchSlicedImages();
};

export const loadCategoryImagesInHashMap = (items) => {
  return () => fetchSlicedImages({ items });
};

export const setCurrentItem = (item) => {
  return (dispatch) =>
    dispatch({
      type: SET_CURRENT_ITEM,
      payload: item,
    });
};

export const addImageToSelected = (image, category) => {
  return (dispatch) =>
    dispatch({
      type: ADD_TO_CURRENT_IMAGES,
      image,
      category,
    });
};

export const removeImageFromSelected = (category) => {
  return (dispatch, getState) => {
    const { collection } = getState();
    const currentId = collection.get("currentId");

    const currentDefaultImages = constants.DEFAULT_RENDERS[currentId];
    if (currentDefaultImages && category in currentDefaultImages) {
      dispatch(
        addImageToSelected(
          `${config.s3BucketUrl}/utils/${currentDefaultImages[category]}`,
          category
        )
      );
    } else {
      dispatch({
        type: REMOVE_FROM_CURRENT_IMAGES,
        category,
      });
    }
  };
};

export const syncSelectedItemsAndImages = () => {
  return (dispatch, getState) => {
    const { collection } = getState();
    const currentImagesMap = collection.get("currentImagesMap");
    const itemsData = collection.get("itemsData");

    if (itemsData.size === 0) return;

    const selectedItemsMap = new OrderedMap(
      currentImagesMap.map((v, k) => {
        const render = v.split("/").pop();
        return render
          ? itemsData.get(k)?.find((item) => item.get("render") === render)
          : render;
      })
    );

    dispatch(setSelectedItemsMap(selectedItemsMap));
  };
};

export const setBaseImage = (image) => {
  return (dispatch) =>
    dispatch({
      type: SET_BASE_IMAGE,
      image,
    });
};

export const getImagesFromHashMap = (images) => {
  return (_, getState) => {
    const { collection, experience } = getState();
    const currentId = collection.get("currentId");
    const hashMap = experience.getIn(["imagesHashMap", currentId]);

    return images.map((img) => {
      if (!img) return null;
      const imageName = img.split("/").pop();
      return hashMap.has(imageName) ? hashMap.get(imageName) : img;
    });
  };
};

export const addToMergedImagesMap = (hash, key) => {
  return (dispatch) =>
    dispatch({
      type: ADD_TO_MERGED_IMAGES_MAP,
      hash,
      key,
    });
};

export const loadVariant = (loader = true) => {
  return async (dispatch) => {
    loader && dispatch(setOverlayLoaderState("loader"));
    await loadSelectedItemsPanorama();
    loader && dispatch(setOverlayLoaderState("none"));
  };
};

export const selectItem = (item) => {
  return (dispatch, getState) => {
    const { collection } = getState();
    const currentId = collection.get("currentId");
    const collectionName = collection.getIn(["currentCollection", "type_name"]);

    dispatch({
      type: ADD_TO_SELECTED_ITEMS,
      item: item,
      category: item.get("category"),
    });

    const imageUrl = `${config.s3BucketUrl}/render_360/${currentId}/${item.get(
      "render"
    )}`;
    dispatch(addImageToSelected(imageUrl, item.get("category")));

    track("Product Tile", {
      [trackingProps.ROOM_NAME]: collectionName,
      [trackingProps.NAV_CATEGORY]: item.get("category"),
      [trackingProps.PRODUCT_NAME]: item.get("name"),
      [trackingProps.BRAND_NAME]: item.get("brand"),
    });
  };
};

export const removeItem = (category) => {
  return (dispatch) => {
    dispatch({
      type: REMOVE_FROM_SELECTED_ITEMS,
      category: category,
    });

    dispatch(removeImageFromSelected(category));
  };
};

export const resetCollection = () => {
  return (dispatch, getState) => {
    const { collection } = getState();
    const currentId = collection.get("currentId");
    const [...itemList] = collection
      .getIn(["currentConfig", "sortingOrder"])
      .values();
    const emptyCategoriesMap = new OrderedMap(itemList.map((key) => [key, ""]));

    const defaultCollectionRenders = constants.DEFAULT_RENDERS[currentId];
    const defaultImagesMap = new OrderedMap(
      itemList.map((key) => [
        key,
        defaultCollectionRenders && key in defaultCollectionRenders
          ? `${config.s3BucketUrl}/utils/${defaultCollectionRenders[key]}`
          : "",
      ])
    );

    dispatch(setSelectedItemsMap(emptyCategoriesMap));
    dispatch(setCurrentImagesMap(defaultImagesMap));
  };
};

export const applyFilters = () => {
  return (dispatch, getState) => {
    const { collection, interaction } = getState();
    const itemsData = collection.get("itemsData");
    const currentCategory = collection.get("currentCategory");

    const appliedFilters = interaction.get("appliedFilters").toJS()[
      currentCategory
    ];
    const sortState = interaction.get("sortState");
    const searchString = interaction.get("searchString");
    if (itemsData.has(currentCategory)) {
      const itemsList = itemsData.get(currentCategory).toJS();
      let list = applyPropertyFilters(itemsList, appliedFilters);
      list = applySortAndSearch(list, sortState, searchString);
      // console.table(appliedFilters);
      // console.log(`Search String ${searchString} , ${searchString.length} , ${typeof searchString}`);
      // if(!list?.length && !searchString?.length && (Object.keys(appliedFilters).length === 1 && Object.values(appliedFilters['brand'])[0] === true) ){
      //   list = itemsList;
      //   dispatch(setFilterDisclaimer("disclaimer", currentCategory));
      // }
      // const filterMessageState = interaction.get('filterDisclaimers').get(currentCategory);
      // console.log('This is the state', filterMessageState ,  filterMessageState === 'disclaimer');
      // if(!list?.length && !searchString?.length && filterMessageState === 'disclaimer'){
      //   list = itemsList;
      // }
      dispatch(setFilteredItems(list));
    }
  };
};

export const sendEmail = (email) => {
  const url = "/email_360";

  return async (_, getState) => {
    const { collection, interaction } = getState();
    const [...itemData] = collection.get("selectedItemsMap").values();
    const shareImage = interaction.get("shareImage");

    const urlToShare = getShareUrl();

    const data = {
      url: urlToShare,
      email: email,
      shareImage: shareImage,
      itemData: itemData.filter((image) => !!image),
      nurseryUrl: urlToShare,
    };

    try {
      await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
    }
  };
};

export const uploadShareImage = () => {
  const url = "/upload_share_image/";

  return async (dispatch, getState) => {
    dispatch(setOverlayLoaderState("loader"));

    const { interaction, collection } = getState();
    const PSV = interaction.get("PSV");
    const currentId = collection.get("currentId");
    const roomAngle = collection.getIn(["currentConfig", "roomAngle"]).toJS();

    const isMobile = window.innerWidth <= 600;

    if (isMobile) PSV.resizeView("33.5%");
    PSV.rotate(roomAngle);

    setTimeout(async () => {
      const captureImgStr =
        PSV.renderer.renderer.domElement.toDataURL("image/png");
      PSV.resetView();

      const imageWidth = 700;
      const imageHeight = imageWidth / 1.6;

      await imageToDataUri(
        captureImgStr,
        imageWidth,
        imageHeight,
        async (resizeImage) => {
          const strRemove = "data:image/png;base64,";
          const imageString = resizeImage.substring(strRemove.length);
          const encryptedCode = `${uniqueCode()}${currentId}`;

          const data = {
            name: `${encryptedCode}.jpg`,
            thumbnail: imageString,
          };

          await axios.post(url, data);
          dispatch(
            setShareImage(
              `${config.s3BucketUrl}/share-images/${encryptedCode}.jpg`
            )
          );
          dispatch(setOverlayLoaderState("none"));
        }
      );
    }, 50);
  };
};

export const shareEmail = (email, name, message) => {
  const url = "/share_email";

  return async (_, getState) => {
    const { interaction, collection } = getState();
    const shareImage = interaction.get("shareImage");
    const [...itemData] = collection.get("selectedItemsMap").values();

    const data = {
      emailTo: email,
      yourName: name,
      emailMessage: message,
      itemData: itemData,
      shareUrl: getShareUrl(),
      shareImage: shareImage,
      nurseryUrl: getShareUrl(),
    };

    try {
      await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
    }
  };
};

export const setConnectedRooms = (map) => {
  return (dispatch) =>
    dispatch({
      type: SET_CONNECTED_ROOMS,
      payload: map,
    });
};

export const prefetchConnectedRooms = () => {
  return (dispatch, getState) => {
    const { collection, experience } = getState();
    const currentId = collection.get("currentId");
    const allCollections = experience.get("allCollections");
    const imagesHashMap = experience.get("imagesHashMap");

    const currentRoom = allCollections.find(
      (value) => value.get("room_type_id") === currentId
    );
    const connectedRooms = currentRoom.get("connected_with");

    const connectedRoomsMap = {};

    connectedRooms.forEach(async (roomId) => {
      const room = allCollections.find(
        (value) => value.get("room_type_id") === roomId
      );
      connectedRoomsMap[room.get("type_name")] = room;

      const itemsDataUrl = `/shop_room_360/${roomId}/`;
      axios.get(itemsDataUrl);

      if (!imagesHashMap.get(roomId)?.has("baseImage.jpg")) {
        const baseImageUrl = `${config.s3BucketUrl}/render_360/${roomId}/baseImage.jpg`;
        imageXhr("baseImage.jpg", baseImageUrl, roomId);
      }

      if (!imagesHashMap.get(roomId)?.has("baseImage-low.jpg")) {
        const baseImageLowUrl = `${
          config.s3BucketUrl
        }/render_360/${roomId}/baseImage-low.jpg?${new Date().getTime()}`;
        imageXhr("baseImage-low.jpg", baseImageLowUrl, roomId);
      }
    });

    dispatch(setConnectedRooms(connectedRoomsMap));
  };
};
