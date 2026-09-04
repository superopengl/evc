import React from 'react';
import PropTypes from 'prop-types';
import { theme } from 'antd';

/**
 * antd 6 deprecates `List`, and its replacement `Listy` deliberately ships no `List.Item.Meta` -
 * the migration guide (https://ant.design/components/list#faq-migrate-from-list) says to
 * recompose the preset structures with plain JSX inside `itemRender`.
 *
 * Eight call sites used Meta, so rather than re-derive the same avatar/title/description flex box
 * eight times this reproduces it once, with the metrics antd's own `.ant-list-item-meta` used:
 * avatar gutter `padding`, title `fontSize` with a `marginXXS` gap, description in
 * `colorTextDescription`. Tokens, not literals, so it tracks `antdTheme.js`.
 *
 * This is presentational only. The surrounding `<li>` is gone - Listy renders each item into its
 * own `.ant-listy-item` div, so `itemRender` returns just this content.
 */
export const ListyItemMeta = ({ avatar, title, description }) => {
  const { token } = theme.useToken();

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', maxWidth: '100%' }}>
      {avatar && <div style={{ marginInlineEnd: token.padding }}>{avatar}</div>}
      {(title || description) && (
        <div style={{ flex: '1 0', width: 0, color: token.colorText }}>
          {title && (
            <h4 style={{
              margin: `0 0 ${token.marginXXS}px 0`,
              color: token.colorText,
              fontSize: token.fontSize,
              lineHeight: token.lineHeight,
            }}>{title}</h4>
          )}
          {description && (
            <div style={{
              color: token.colorTextDescription,
              fontSize: token.fontSize,
              lineHeight: token.lineHeight,
            }}>{description}</div>
          )}
        </div>
      )}
    </div>
  );
};

ListyItemMeta.propTypes = {
  avatar: PropTypes.node,
  title: PropTypes.node,
  description: PropTypes.node,
};

export default ListyItemMeta;
