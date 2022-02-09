import Immutable from 'immutable';
import * as ActionType from 'actions/interaction';

export const initialState = Immutable.fromJS({
  PSV: null,
  isAppLoading: true,
  sidebarComponent: '',
  isSidebarOpen: false,
  overlayLoaderState: 'none',
  sortState: 'newest',
  searchString: '',
  appliedFilters: {},
  isSaveShareOpen: false,
  shareImage: '',
  isResetOpen: false,
  isChangeRoomOpen: false,
  filterCount: 0,
  filterDisclaimers: {},
  isMarkerDropdownOpen: false,
  dropdownPosition: {},
  markerDropdownCategories: [],
  markerSelected: '',
});

export default function interaction(state = initialState, action) {
  switch (action.type) {
    case ActionType.SET_PSV_OBJECT:
      return state.set('PSV', action.payload);
    case ActionType.SET_SIDEBAR_COMPONENT:
      return state.set('sidebarComponent', action.payload);
    case ActionType.SET_SIDEBAR_OPEN:
      return state.set('isSidebarOpen', action.payload);
    case ActionType.SET_MARKERDROPDOWN_OPEN:
      return state.set('isMarkerDropdownOpen', action.payload);
    case ActionType.SET_MARKER_SELECTED:
      return state.set('markerSelected', action.payload);
    case ActionType.SET_DROPDOWN_POSITION:
      return state.set('dropdownPosition', action.payload);
    case ActionType.SET_DROPDOWN_CATEGORIES:
      return state.set('markerDropdownCategories', action.payload);
    case ActionType.SET_LOADER_STATE:
      return state.set('overlayLoaderState', action.payload);
    case ActionType.SET_SORT_STATE:
      return state.set('sortState', action.payload);
    case ActionType.SET_SEARCH_STRING:
      return state.set('searchString', action.payload);
    case ActionType.SET_APPLIED_FILTERS:
      return state.setIn(
        ['appliedFilters', action.category],
        Immutable.fromJS(action.filters)
      );
    case ActionType.SET_ALL_APPLIED_FILTERS:
      return state.set('appliedFilters', Immutable.fromJS(action.payload));
    case ActionType.SET_SAVE_SHARE_OPEN:
      return state.set('isSaveShareOpen', action.payload);
    case ActionType.SET_RESET_OPEN:
      return state.set('isResetOpen', action.payload);
    case ActionType.SET_SETTING_OPEN:
      return state.set('isSettingOpen', action.payload);
    case ActionType.SET_CHANGE_ROOM_OPEN:
      return state.set('isChangeRoomOpen', action.payload);
    case ActionType.SET_FILTER_COUNT:
      return state.set('filterCount', action.payload);
    case ActionType.SET_SHARE_IMAGE:
      return state.set('shareImage', action.payload);
    case ActionType.SET_APP_LOADING:
      return state.set('isAppLoading', action.payload);
    case ActionType.SET_FILTER_DISCLAIMER:
      return state.setIn(['filterDisclaimers', action.category], action.payload);
    case ActionType.SET_ALL_FILTER_DISCLAIMERS:
      return state.set('filterDisclaimers', Immutable.fromJS(action.payload));
    case ActionType.RESET_INTERACTION:
      return initialState;
    default:
      return state;
  }
}
