import React from 'react';
import { Tooltip } from 'antd';


export const FairValueSpecialLabel = (props) => {
  const { show, message, color } = props;

  return show ? <Tooltip
    placement="topRight"
    title={message}>
    <div style={{
      position: 'relative',
      display: 'inline-block',
      top: -4,
      backgroundColor: color || '#d7183f',
      width: 6,
      height: 6,
      borderRadius: 999
    }}></div>
  </Tooltip> : null;
}
