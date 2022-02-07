import Immutable from 'immutable';
import * as ActionType from 'actions/experience';

export const initialState = Immutable.fromJS({
  allCollections: [],
  isIntroScreen: false,
  canvasRefs: {},
  imagesHashMap: {},
  currentBrand: null,
});

export default function collection(state = initialState, action) {
  switch (action.type) {
    case ActionType.SET_ALL_COLLECTIONS:
      return state.set('allCollections', Immutable.fromJS(action.payload));
    case ActionType.SET_TOOLTIP_STATUS:
      return state.set('isIntroScreen', action.payload);
    case ActionType.SET_CANVAS_REF:
      return state.setIn(['canvasRefs', action.key], action.ref);
    case ActionType.ADD_TO_HASH_MAP:
      return state.setIn(['imagesHashMap', action.id, action.key], action.value);
    case ActionType.SET_CURRENT_BRAND:
      return state.set('currentBrand', action.brand);
    default:
      return state;
  }
}
