import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Tag } from 'antd';
import * as tinycolor from 'tinycolor2';

const { Text } = Typography;


const StockTag = (props) => {

  const { children, color: backgroundColor } = props;

  const color = tinycolor(backgroundColor).isLight() ? '#000000' : '#ffffff';
  return (
    <Tag style={{
      padding: '6px 16px', 
      borderRadius: 30, 
      backgroundColor, 
      color, 
      fontWeight: 'bold',
      border: 'none'
      }}>
      {children}
      </Tag>
  );
};

StockTag.propTypes = {
  // value: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired
};

StockTag.defaultProps = {
};

export default StockTag;
