import React from 'react';

export const APP_TITLE = 'Easy Value Check';

/**
 * Walks a route `name` looking for the id of a <FormattedMessage>, including through fragments
 * such as `<><FormattedMessage id="menu.earnCommission" /> 🔥</>`.
 */
function findMessageId(node) {
  if (!node || typeof node === 'string' || typeof node === 'number') {
    return null;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const id = findMessageId(child);
      if (id) {
        return id;
      }
    }
    return null;
  }
  if (node.props?.id) {
    return node.props.id;
  }
  const children = node.props?.children;
  return children ? findMessageId(React.Children.toArray(children)) : null;
}

/**
 * pro-layout builds the document title as `${route.name} - ${title}`. Our route names are
 * <FormattedMessage> elements so the menu can localise them, and a React element interpolated
 * into a template literal stringifies to "[object Object]" - which is what ended up in the
 * browser tab. This resolves the message id back to real text instead.
 */
export function createPageTitleRender(intl) {
  return (_props, _defaultPageTitle, info) => {
    const name = info?.pageName;

    if (typeof name === 'string' && name.trim()) {
      return `${name} - ${APP_TITLE}`;
    }

    const id = findMessageId(name);
    if (id) {
      const text = intl.formatMessage({ id, defaultMessage: '' });
      if (text) {
        return `${text} - ${APP_TITLE}`;
      }
    }

    // No resolvable page name (the catch-all route, for one) - just the app name.
    return APP_TITLE;
  };
}
