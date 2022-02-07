import { track, trackingProps } from 'helpers/analyticsService';

import { setCurrentItem, setCurrentCategory } from './collection';

import { handleClusterMarkerState } from '../helpers/PSVUtils';

export const SET_PSV_OBJECT = Symbol('SET_PSV_OBJECT');
export const SET_SIDEBAR_COMPONENT = Symbol('SET_SIDEBAR_COMPONENT');
export const SET_SIDEBAR_OPEN = Symbol('SET_SIDEBAR_OPEN');
export const SET_MARKERDROPDOWN_OPEN = Symbol('SET_MARKERDROPDOWN_OPEN');
export const SET_DROPDOWN_POSITION = Symbol('SET_DROPDOWN_POSITION');
export const SET_DROPDOWN_CATEGORIES = Symbol('SET_DROPDOWN_CATEGORIES');
export const SET_LOADER_STATE = Symbol('SET_LOADER_STATE');
export const SET_SORT_STATE = Symbol('SET_SORT_STATE');
export const SET_SEARCH_STRING = Symbol('SET_SEARCH_STRING');
export const SET_APPLIED_FILTERS = Symbol('SET_APPLIED_FILTERS');
export const SET_SAVE_SHARE_OPEN = Symbol('SET_SAVE_SHARE_OPEN');
export const SET_SHARE_IMAGE = Symbol('SET_SHARE_IMAGE');
export const SET_RESET_OPEN = Symbol('SET_RESET_OPEN');
export const SET_SETTING_OPEN = Symbol('SET_SETTING_OPEN');
export const SET_CHANGE_ROOM_OPEN = Symbol('SET_CHANGE_ROOM_OPEN');
export const RESET_INTERACTION = Symbol('RESET_INTERACTION');
export const SET_FILTER_COUNT = Symbol('SET_FILTER_COUNT');
export const SET_APP_LOADING = Symbol('SET_APP_LOADING');
export const SET_FILTER_DISCLAIMER = Symbol('SET_FILTER_DISCLAIMER');
export const SET_ALL_APPLIED_FILTERS = Symbol('SET_ALL_APPLIED_FILTERS');
export const SET_ALL_FILTER_DISCLAIMERS = Symbol('SET_ALL_FILTER_DISCLAIMERS');
export const SET_MARKER_SELECTED = Symbol('SET_MARKER_SELECTED');

export const setFilterDisclaimer = (state, category) => {
  return dispatch =>
    dispatch({
      type: SET_FILTER_DISCLAIMER,
      payload: state,
      category,
    });
};

export const setAllFilterDisclaimers = disclaimers => {
  return dispatch =>
    dispatch({
      type: SET_ALL_FILTER_DISCLAIMERS,
      payload: disclaimers,
    });
};

export const resetInteraction = () => {
  return dispatch =>
    dispatch({
      type: RESET_INTERACTION,
    });
};

export const setAppLoading = state => {
  return dispatch =>
    dispatch({
      type: SET_APP_LOADING,
      payload: state,
    });
};

export const setPSV = obj => {
  return dispatch =>
    dispatch({
      type: SET_PSV_OBJECT,
      payload: obj,
    });
};

export const setSidebarComponent = componentName => {
  return dispatch =>
    dispatch({
      type: SET_SIDEBAR_COMPONENT,
      payload: componentName,
    });
};

export const setSidebarOpen = state => {
  return dispatch => {
    dispatch({
      type: SET_SIDEBAR_OPEN,
      payload: state,
    });
  };
};

export const setMarkerDropdownOpen = state => {
  return dispatch => {
    dispatch({
      type: SET_MARKERDROPDOWN_OPEN,
      payload: state,
    });
  };
};

export const setMarkerSelected = state => {
  return dispatch => {
    dispatch({
      type: SET_MARKER_SELECTED,
      payload: state,
    });
  };
};

export const setMarkerDropdownCategories = state => {
  return dispatch => {
    dispatch({
      type: SET_DROPDOWN_CATEGORIES,
      payload: state,
    });
  };
};

export const setDropdownPosition = state => {
  return dispatch => {
    dispatch({
      type: SET_DROPDOWN_POSITION,
      payload: state,
    });
  };
};

export const setAllAppliedFilters = filters => {
  return dispatch =>
    dispatch({
      type: SET_ALL_APPLIED_FILTERS,
      payload: filters,
    });
};

export const setOverlayLoaderState = state => {
  return dispatch =>
    dispatch({
      type: SET_LOADER_STATE,
      payload: state,
    });
};

export const onCategoryClick = (category, trackingText) => {
  return (dispatch, getState) => {
    dispatch(setMarkerDropdownOpen(false));
    dispatch(setSidebarOpen(true));
    dispatch(setSidebarComponent('ProductsList'));
    dispatch(setCurrentCategory(category));

    const { collection, interaction } = getState();
    const currentRoomName = collection.getIn(['currentCollection', 'type_name']);
    const markerDropdownCategories = interaction.get('markerDropdownCategories');
    const markerSelected = interaction.get('markerSelected');

    if (markerDropdownCategories?.indexOf(category) !== -1) {
      handleClusterMarkerState(markerSelected, true);
    }

    track(
      trackingText,
      {
        [trackingProps.ROOM_NAME]: currentRoomName,
        [trackingProps.NAV_CATEGORY]: category,
      },
      'Product Menu'
    );
  };
};

export const onItemDetailsClick = item => {
  return dispatch => {
    dispatch(setSidebarComponent('ProductDetailsPage'));
    dispatch(setCurrentItem(item));

    track(
      'View Product Details',
      {
        [trackingProps.NAV_CATEGORY]: item.get('category'),
        [trackingProps.PRODUCT_NAME]: item.get('name'),
        [trackingProps.BRAND_NAME]: item.get('brand'),
      },
      'Product Detail'
    );
  };
};

export const onBackButtonClick = () => {
  return (dispatch, getState) => {
    const { interaction } = getState();

    switch (interaction.get('sidebarComponent')) {
      case 'CategoriesList':
        return null;
      case 'ProductsList':
        return dispatch(setSidebarComponent('CategoriesList'));
      case 'ProductDetailsPage':
        return dispatch(setSidebarComponent('ProductsList'));
      case 'FiltersPage':
        return dispatch(setSidebarComponent('ProductsList'));
      case 'CuratedRoom':
        return dispatch(setSidebarComponent('CuratedRoom'));
      default:
        dispatch(setCurrentCategory(null));
        return dispatch(setSidebarComponent(null));
    }
  };
};

export const onFiltersClick = () => {
  return dispatch => {
    dispatch(setSidebarComponent('FiltersPage'));
  };
};

export const setSortState = state => {
  return (dispatch, getState) => {
    dispatch({
      type: SET_SORT_STATE,
      payload: state,
    });

    const { collection } = getState();
    const currentCategory = collection.get('currentCategory');
    const currentRoomName = collection.getIn(['currentCollection', 'type_name']);

    const trackStringMap = {
      lowToHigh: 'low to high',
      highToLow: 'high to low',
      newest: 'newest',
    };

    track(`${trackStringMap[state]} Selected`, {
      [trackingProps.ROOM_NAME]: currentRoomName,
      [trackingProps.NAV_CATEGORY]: currentCategory,
      [trackingProps.SORT_CATEFORY_TYPE]: trackStringMap[state],
    });
  };
};

export const setSearchString = string => {
  return dispatch =>
    dispatch({
      type: SET_SEARCH_STRING,
      payload: string,
    });
};

export const setAppliedFiltersByCategory = (selectedFilters, category) => {
  return dispatch => {
    Object.keys(selectedFilters).forEach(filter => {
      Object.keys(selectedFilters[filter]).forEach(option => {
        if (!selectedFilters[filter][option]) {
          delete selectedFilters[filter][option];
        }
      });
    });

    dispatch({
      type: SET_APPLIED_FILTERS,
      filters: selectedFilters,
      category: category,
    });
  };
};

export const setAppliedFilters = selectedFilters => {
  return (dispatch, getState) => {
    const { collection, experience } = getState();
    const currentCategory = collection.get('currentCategory');
    const currentBrand = experience.get('currentBrand');
    if (currentBrand) {
      dispatch(setFilterDisclaimer(null, currentCategory));
    }
    dispatch(setAppliedFiltersByCategory(selectedFilters, currentCategory));
  };
};

export const onFiltersApply = selectedFilters => {
  return dispatch => {
    dispatch(setSidebarComponent('ProductsList'));
    dispatch(setAppliedFilters(selectedFilters));
  };
};

export const resetFilters = () => {
  return dispatch => {
    dispatch(setSearchString(''));
    dispatch(setAllAppliedFilters({}));
    dispatch(setAllFilterDisclaimers({}));
  };
};

export const setSaveShareOpen = state => {
  return dispatch => {
    dispatch(setSidebarOpen(false));
    dispatch(setSidebarComponent(null));
    dispatch(setCurrentCategory(null));
    dispatch({
      type: SET_SAVE_SHARE_OPEN,
      payload: state,
    });
  };
};

export const setFilterCount = state => {
  return dispatch => {
    dispatch({
      type: SET_FILTER_COUNT,
      payload: state,
    });
  };
};

export const setResetOpen = state => {
  return dispatch => {
    dispatch(setSidebarOpen(false));
    dispatch(setSidebarComponent(null));
    dispatch(setCurrentCategory(null));
    dispatch({
      type: SET_RESET_OPEN,
      payload: state,
    });
  };
};

export const setSettingOpen = state => {
  return dispatch => {
    dispatch(setSidebarOpen(false));
    dispatch(setSidebarComponent(null));
    dispatch(setCurrentCategory(null));
    dispatch({
      type: SET_SETTING_OPEN,
      payload: state,
    });
  };
};

export const setChangeRoomOpen = state => {
  return dispatch => {
    dispatch({
      type: SET_CHANGE_ROOM_OPEN,
      payload: state,
    });
  };
};

export const setShareImage = image => {
  return dispatch =>
    dispatch({
      type: SET_SHARE_IMAGE,
      payload: image,
    });
};
