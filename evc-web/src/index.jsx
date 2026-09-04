import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';

// Self-hosted webfonts, bundled by Vite rather than pulled from a CDN, so the
// Docker build has no network dependency and there is no render-blocking
// third-party request.
//
// Archivo ships a width axis as well as a weight one; `wdth.css` is the cut
// that carries it (font-stretch: 62%-125%). The headings are set wide, which
// is where the display voice comes from - see .evc-display in index.less.
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';

import './index.less';
import App from './App';
import { antdTheme } from './antdTheme';
import * as serviceWorker from './serviceWorker';

// The static Modal.confirm/info/warning calls (14 of them) render into their own React root, so
// they never see the <ConfigProvider theme> in App.jsx - antd warns "Static function can not
// consume context" and they come out in stock antd blue instead of the brand green. This sets
// the global theme those detached roots read, which is cheaper than routing every call site
// through App.useApp().
ConfigProvider.config({ theme: antdTheme });

console.log(process.env);

createRoot(document.getElementById('root')).render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
