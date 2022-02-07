import Immutable from 'immutable';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { throttle } from 'lodash';
import { createStore, applyMiddleware, compose } from 'redux';

import * as ActionType from 'actions/experience';

import config from 'config';
import rootReducer from 'reducers';

import { saveState } from './localStorage';

function createMiddlewares() {
  const middlewares = [thunkMiddleware];

  if (config.env === 'development' && typeof window !== 'undefined') {
    middlewares.push(
      createLogger({
        level: 'info',
        collapsed: true,
        predicate: (getState, action) => {
          return action.type !== ActionType.ADD_TO_HASH_MAP;
        },
        stateTransformer: state => {
          const newState = {};
          Object.keys(state).forEach((s, i) => {
            if (Immutable.Iterable.isIterable(s)) {
              newState[i] = s.toJS();
            } else {
              newState[i] = s;
            }
          });
          return newState;
        },
      })
    );
  }

  return middlewares;
}

function immutableChildren(obj) {
  const state = {};
  Object.keys(obj).forEach(key => {
    state[key] = Immutable.fromJS(obj[key]);
  });
  return state;
}

const store = (initialState = {}) => {
  const middlewares = createMiddlewares();
  const state = immutableChildren(initialState);

  const store = createStore(rootReducer, state, compose(applyMiddleware(...middlewares)));

  store.subscribe(
    throttle(() => {
      const { collection } = store.getState();

      const currentId = collection.get('currentId');
      const currentVersion = collection.get('currentVersion');

      saveState(currentId, currentVersion, {
        currentImagesMap: collection.get('currentImagesMap'),
        selectedItemsMap: collection.get('selectedItemsMap'),
      });
    }, 1000)
  );

  return store;
};

export default store;
