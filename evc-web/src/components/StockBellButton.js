import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@ant-design/icons';
import { Tooltip } from 'antd';
import {BsBellFill, BsBell} from 'react-icons/bs';

export const StockBellButton = (props) => {

  const { onChange, value, size } = props;

  const style = {
    fontSize: size,
    color: value ? '#fadb14' : '#8c8c8c',
  };

  const handleToggleValue = e => {
    e.stopPropagation();
    onChange(!value);
    if(value) {

    }
  }

  return (
    value ?
      <Tooltip title="Click to turn off alert email">
        <Icon style={style} component={() => <BsBellFill/>} onClick={handleToggleValue} />
      </Tooltip> :
      <Tooltip title="Click to turn on alert email">
        <Icon style={style} component={() => <BsBell/>} onClick={handleToggleValue} />
      </Tooltip>
  );
};

StockBellButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  size: PropTypes.number,
};

StockBellButton.defaultProps = {
  onChange: () => { },
  value: false,
  size: 18,
};

