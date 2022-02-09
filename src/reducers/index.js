import { combineReducers } from 'redux';

import collection from './collection';
import interaction from './interaction';
import experience from './experience';

export default combineReducers({
  collection,
  interaction,
  experience,
});
