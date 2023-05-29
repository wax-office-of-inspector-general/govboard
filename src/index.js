import React from 'react';
import ReactDOM from 'react-dom';
import App  from './App';
import * as serviceWorker from './serviceWorker';
import { UALProvider, withUAL } from 'ual-reactjs-renderer';
import {BrowserRouter as Router} from 'react-router-dom';

import { Anchor } from 'ual-anchor';
import { Wax } from '@eosdacio/ual-wax';

import 'bootstrap/dist/css/bootstrap.min.css';

import { Global, css } from '@emotion/react';
import normalize from 'normalize.css';

const waxChain = {
  chainId: process.env.REACT_APP_WAX_CHAINID,
  rpcEndpoints: [{
    protocol: process.env.REACT_APP_WAX_PROTOCOL,
    host: process.env.REACT_APP_WAX_HOST,
    port: process.env.REACT_APP_WAX_PORT,
  }]
}

const anchor = new Anchor([waxChain], { appName: 'govboard' });
const waxcloud = new Wax([waxChain], { appName: 'govboard' });
const UALConsumer = withUAL(App);


ReactDOM.render(
    <UALProvider chains={[waxChain]} authenticators={[waxcloud, anchor]} appName="govboard">
        <Global styles={css`${normalize}`}/>
        <Router>
            <UALConsumer />
        </Router>
    </UALProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
