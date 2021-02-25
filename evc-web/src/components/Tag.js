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

  const { children, clickable, checked, color: propColor, style: propStyle, onClick, ...other } = props;

  const style = {
    // color: tinycolor(propColor).isLight() ? '#000000' : '#ffffff',
    // backgroundColor: propColor,
    textAlign: 'center',
    // border: `1px solid ${propColor}`,
    ...propStyle,
  }

  const TagComponent = clickable ? ClicableTag : AntdTag;

  const colorProp = checked ? {color: '#15be53'} : null;

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
  color: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};

Tag.defaultProps = {
  checked: false,
  clickable: false,
  onClick: () => { }
};

export default Tag;
