import React from 'react';
import { createRoot } from 'react-dom/client';
// antd 5 needs this shim to work with React 19: it repoints the imperative
// message/notification/Modal APIs off the removed ReactDOM.render.
import '@ant-design/v5-patch-for-react-19';
import './index.less';
import App from './App';
import * as serviceWorker from './serviceWorker';

console.log(process.env);

createRoot(document.getElementById('root')).render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
