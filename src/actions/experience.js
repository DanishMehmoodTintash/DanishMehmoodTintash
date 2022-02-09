import axios from 'helpers/apiService';
import storageService from 'helpers/storageService';

export const SET_ALL_COLLECTIONS = Symbol('SET_ALL_COLLECTIONS');
export const SET_TOOLTIP_STATUS = Symbol('SET_TOOLTIP_STATUS');
export const SET_CANVAS_REF = Symbol('SET_CANVAS_REF');
export const ADD_TO_HASH_MAP = Symbol('ADD_TO_HASH_MAP');
export const SET_CURRENT_BRAND = Symbol('SET_CURRENT_BRAND');

export const fetchAllCollections = () => {
  const url = '/shop_room_360/';
  return async dispatch => {
    try {
      const response = await axios.get(url);
      dispatch({
        type: SET_ALL_COLLECTIONS,
        payload: response.data,
      });
    } catch (err) {
      console.log(err);
    }
  };
};

export const setTooltipStatus = state => {
  return dispatch => {
    const sessionState = storageService().session.getItem('tooltipStatus');
    if (sessionState === 'false' && state) return;

    storageService().session.setItem('tooltipStatus', state);

    dispatch({
      type: SET_TOOLTIP_STATUS,
      payload: state,
    });
  };
};

export const setCanvasRef = (ref, key) => {
  return dispatch =>
    dispatch({
      type: SET_CANVAS_REF,
      ref,
      key,
    });
};

export const addImageToHashMap = (id, key, value) => {
  return dispatch =>
    dispatch({
      type: ADD_TO_HASH_MAP,
      id,
      key,
      value,
    });
};

export const setCurrentBrand = brand => {
  return dispatch => dispatch({ type: SET_CURRENT_BRAND, brand });
};
