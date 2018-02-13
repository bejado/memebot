import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store, { history } from './store';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import registerServiceWorker from './registerServiceWorker';
import 'skeleton-css/css/normalize.css';
import 'skeleton-css/css/skeleton.css';

const target = document.getElementById('root');

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <div>
        <App />
      </div>
    </ConnectedRouter>
  </Provider>,
  target
);

registerServiceWorker();
