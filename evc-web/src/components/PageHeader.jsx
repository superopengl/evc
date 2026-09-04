import React from 'react';
import PropTypes from 'prop-types';
import { Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

/**
 * antd 5 removed PageHeader (it lives on in @ant-design/pro-components, which we only pull in
 * for the logged-in layout). This covers the props the one call site uses: onBack, title, extra
 * and children. `ghost` is accepted and ignored - v4's ghost={false} meant "solid background",
 * which that call site already sets through `style`.
 */
export const PageHeader = ({ onBack, title, extra, style, children }) => (
  <div style={style}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      {onBack && <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} aria-label="Back" />}
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>{title}</div>
      {extra ? <Space wrap>{extra}</Space> : null}
    </div>
    {children ? <div style={{ marginTop: 12 }}>{children}</div> : null}
  </div>
);

PageHeader.propTypes = {
  onBack: PropTypes.func,
  title: PropTypes.node,
  extra: PropTypes.node,
  style: PropTypes.object,
};

export default PageHeader;
