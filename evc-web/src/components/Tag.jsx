import React from 'react';
import PropTypes from 'prop-types';
import { Tag as AntdTag } from 'antd';
import styled from 'styled-components';


const ClicableTag = styled(AntdTag)`
  &:hover {
    cursor: pointer;
  }
`;

const Tag = (props) => {

  const { children, clickable = false, checked = false, style: propStyle, onClick = () => { }, ...other } = props;

  const style = {
    textAlign: 'center',
    ...propStyle,
  }

  const TagComponent = clickable ? ClicableTag : AntdTag;

  // `success` is one of antd's preset *status* colours, so the fill comes from the configured
  // `colorSuccess` token (see src/antdTheme.js) rather than a hex pinned here.
  //
  // `variant="solid"` is load-bearing. antd 6 defaults Tag to `variant="filled"`, which for a
  // status colour resolves to `colorSuccessBg` behind `colorSuccess` text - a pale wash. Only
  // the solid variant puts `colorSuccess` on the background, and `.ant-tag-solid` is what sets
  // `colorTextLightSolid` (white) on the label.
  const colorProp = checked ? { color: 'success', variant: 'solid' } : null;

  return (
    <TagComponent
      onClick={onClick}
      style={style}
      {...other}
      {...colorProp}
    >
      {children}
      {/* {checked && <CheckOutlined style={{ marginLeft: 10 }} />} */}
    </TagComponent>
  );
};

Tag.propTypes = {
  // value: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Tag;
