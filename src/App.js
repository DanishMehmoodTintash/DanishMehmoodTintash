import React from 'react';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Provider } from 'react-redux';
import styledNormalize from 'styled-normalize';
import { BrowserRouter as Router } from 'react-router-dom';

import createStore from './store/createStore';
import theme from './theme';

import CollectionContainer from './containers/CollectionContainer';

import './styles/styles.global.scss';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';

const GlobalStyle = createGlobalStyle`
    ${styledNormalize}
`;

export const store = createStore();

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <GlobalStyle />
          <CollectionContainer />
        </Provider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
