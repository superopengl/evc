import { App, Modal, message as staticMessage, notification as staticNotification } from 'antd';

/**
 * antd's static `Modal.confirm` / `notification.error` render into their own detached React root,
 * so they never see the `<ConfigProvider theme>` in App.jsx. antd warns "Static function can not
 * consume context like dynamic theme" and the dialogs come out in stock antd blue rather than the
 * brand green. `App.useApp()` hands back instances bound to the `<App>` holder that lives *inside*
 * ConfigProvider, which do consume it - that is the fix antd's warning is asking for.
 *
 * The catch is that only 11 of the 14 call sites are components. `util/notify.js` and
 * `services/http.js` are plain modules and cannot call a hook at all, and notify is used a few
 * hundred times, so converting it call-site-by-call-site is not an option. So `AntdStaticHolder`
 * captures the instances once and the wrappers below stand in for the static imports everywhere -
 * one mechanism rather than a hook inside components and something else outside them.
 */
let api = null;

/**
 * Render this once, inside both `<ConfigProvider>` and antd's `<App>`, above anything that opens a
 * dialog. It draws nothing; it exists only to run the hook. Assigning during render rather than in
 * an effect is deliberate: children render before parent effects fire, so an effect here would
 * leave `api` null for any dialog opened during the first paint. The write is idempotent, so
 * StrictMode's double render is harmless.
 */
export const AntdStaticHolder = () => {
  api = App.useApp();
  return null;
};

// App.jsx renders <Loading> until getAuthUser() resolves, so <App> - and this holder - are not
// mounted for the first few hundred ms of a page load. http.js reports a failed request through
// notify, and that initial auth call is a request like any other: if it 500s, notify fires while
// `api` is still null. Falling back to the static API keeps that path working (unthemed, and it
// will log the warning above) instead of throwing a TypeError over the top of the real error.
const fallback = { modal: Modal, notification: staticNotification, message: staticMessage };

// The lookup has to happen per call, not at module scope: these wrappers are imported long before
// <App> first renders, so binding `api.modal` eagerly would capture the fallback forever.
const bind = (namespace, method) => (...args) => (api ?? fallback)[namespace][method](...args);

export const modal = {
  confirm: bind('modal', 'confirm'),
  info: bind('modal', 'info'),
  success: bind('modal', 'success'),
  error: bind('modal', 'error'),
  warning: bind('modal', 'warning'),
};

// No `warn` and no `close` here, unlike the static export: the App instance spells them
// `warning` and `destroy(key)`.
export const notification = {
  open: bind('notification', 'open'),
  info: bind('notification', 'info'),
  success: bind('notification', 'success'),
  error: bind('notification', 'error'),
  warning: bind('notification', 'warning'),
  destroy: bind('notification', 'destroy'),
};

export const message = {
  open: bind('message', 'open'),
  info: bind('message', 'info'),
  success: bind('message', 'success'),
  error: bind('message', 'error'),
  warning: bind('message', 'warning'),
  loading: bind('message', 'loading'),
  destroy: bind('message', 'destroy'),
};
