import Immutable from 'immutable';
import * as ActionType from 'actions/collection';

import storageService from 'helpers/storageService';

export const initialState = Immutable.fromJS({
  currentId: null,
  curatedRoomId: null,
  currentCollection: {},
  currentConfig: null,
  itemsData: {},
  filterOptions: null,
  currentCategory: null,
  currentItem: null,
  mergedImagesHashMap: {},
  baseImage: '',
  currentImagesMap: {},
  selectedItemsMap: {},
  currentPanorama: null,
  filteredItems: [],
  currentVersion: '',
  connectedRooms: {},
  curatedRooms: [],
});

export default function collection(state = initialState, action) {
  switch (action.type) {
    case ActionType.SET_CURRENT_COLLECTION_ID:
      storageService().session.setItem('collectionId', action.payload);
      return action.state.set('currentId', action.payload);
    case ActionType.SET_CURATED_ROOM_ID:
      return state.set('curatedRoomId', action.payload);
    case ActionType.SET_CURRENT_COLLECTION:
      return state.set('currentCollection', action.payload);
    case ActionType.SET_CURRENT_CONFIG:
      return state.set('currentConfig', Immutable.fromJS(action.payload));
    case ActionType.SET_CURRENT_VERSION:
      return state.set('currentVersion', action.payload);
    case ActionType.SET_ITEMS_DATA:
      return state.set('itemsData', Immutable.fromJS(action.payload));
    case ActionType.SET_FILTER_OPTIONS:
      return state.set('filterOptions', Immutable.fromJS(action.payload));
    case ActionType.SET_CURRENT_CATEGORY:
      return state.set('currentCategory', action.payload);
    case ActionType.SET_CURRENT_ITEM:
      return state.set('currentItem', action.payload);
    case ActionType.ADD_TO_SELECTED_ITEMS:
      return state.setIn(['selectedItemsMap', action.category], action.item);
    case ActionType.REMOVE_FROM_SELECTED_ITEMS:
      return state.setIn(['selectedItemsMap', action.category], '');
    case ActionType.SET_SELECTED_ITEMS:
      return state.set('selectedItemsMap', action.payload);
    case ActionType.ADD_TO_CURRENT_IMAGES:
      return state.setIn(['currentImagesMap', action.category], action.image);
    case ActionType.REMOVE_FROM_CURRENT_IMAGES:
      return state.setIn(['currentImagesMap', action.category], '');
    case ActionType.SET_CURRENT_IMAGES:
      return state.set('currentImagesMap', action.payload);
    case ActionType.SET_BASE_IMAGE:
      return state.set('baseImage', action.image);
    case ActionType.SET_CURRENT_PANORAMA:
      return state.set('currentPanorama', action.payload);
    case ActionType.ADD_TO_MERGED_IMAGES_MAP:
      return state.setIn(['mergedImagesHashMap', action.key], action.hash);
    case ActionType.SET_FILTERED_ITEMS:
      return state.set('filteredItems', Immutable.fromJS(action.payload));
    case ActionType.SET_CONNECTED_ROOMS:
      return state.set('connectedRooms', Immutable.fromJS(action.payload));
    case ActionType.SET_CURATED_ROOMS:
      return state.set('curatedRooms', Immutable.fromJS(action.payload));
    default:
      return state;
  }
}
