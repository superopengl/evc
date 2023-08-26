import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';
import styled from 'styled-components';


const ClicableTag = styled(Tag)`
  &:hover {
    cursor: pointer;
  }
`;

const StockTag = (props) => {

  const { children, clickable, checked, color: propColor, style: propStyle, onClick, ...other } = props;

  const style = {
    // color: tinycolor(propColor).isLight() ? '#000000' : '#ffffff',
    // backgroundColor: propColor,
    textAlign: 'center',
    // border: `1px solid ${propColor}`,
    ...propStyle,
  }

  const TagComponent = clickable ? ClicableTag : Tag;

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

StockTag.propTypes = {
  // value: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};

StockTag.defaultProps = {
  checked: false,
  clickable: false,
  onClick: () => { }
};

export default StockTag;
