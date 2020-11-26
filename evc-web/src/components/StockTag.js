import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Tag } from 'antd';
import * as tinycolor from 'tinycolor2';
import chroma from 'chroma-js';
import { CheckOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

const ClicableTag = styled(Tag)`
  &:hover {
    cursor: pointer;
  }
`;

const StockTag = (props) => {

  const { children, clickable, checked, color: propColor, onClick, ...other } = props;

  const style = {
    color: tinycolor(propColor).isLight() ? '#000000' : '#ffffff',
    backgroundColor: propColor,
    border: `1px solid ${propColor}`,
  }
  
  const TagComponent = clickable ? ClicableTag : Tag;

  return (
    <TagComponent 
      onClick={onClick}
      style={{
      // padding: '6px 16px', 
      // borderRadius: 30, 
      ...style,
      // fontWeight: 'bold',
      // width: '100%',
      textAlign: 'center',
      // fontWeight: checked ? 'bold' : 'normal',
      // border: 'none'
      }}
      {...other}
      >
      {children}{checked && <CheckOutlined style={{marginLeft: 10}}/>}
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
  onClick: () => {}
};

export default StockTag;
