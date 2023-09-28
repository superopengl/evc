import React from 'react';
import PropTypes from 'prop-types';
import Icon from '@ant-design/icons';
import { Tooltip } from 'antd';
import {RiMailFill, RiMailForbidLine} from 'react-icons/ri';

export const StockNoticeButton = (props) => {

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
        <Icon style={style} component={() => <RiMailFill />} onClick={handleToggleValue} />
      </Tooltip> :
      <Tooltip title="Click to turn on alert email">
        <Icon style={style} component={() => <RiMailForbidLine/>} onClick={handleToggleValue} />
      </Tooltip>
  );
};

StockNoticeButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  size: PropTypes.number,
};

StockNoticeButton.defaultProps = {
  onChange: () => { },
  value: false,
  size: 18,
};

