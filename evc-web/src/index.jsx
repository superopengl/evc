import React from 'react';
import { createRoot } from 'react-dom/client';

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
import * as serviceWorker from './serviceWorker';

// There was a ConfigProvider.config({ theme }) call here to theme the static Modal.confirm /
// notification.error dialogs, which render in their own React root and never see the
// <ConfigProvider theme> in App.jsx. It only ever patched the colours - antd still warned
// "Static function can not consume context", because the detached root misses locale and
// everything else too. Those call sites now go through antd's <App> instead; see
// util/antdStatic. Nothing reads the global config any more, so it is gone.

console.log(process.env);

createRoot(document.getElementById('root')).render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
