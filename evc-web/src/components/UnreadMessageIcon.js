import React from 'react';
import { Tooltip } from 'antd';
import { MessageOutlined } from '@ant-design/icons';


export const UnreadMessageIcon = props => {
  const style={
    display: 'inline-block',
    ...props.style
  }
  return <div style={style}>
    <Tooltip title="There are unread messages" >
      <MessageOutlined style={{ color: 'rgba(0,0,0,0.3)', marginLeft: 4 }} />
    </Tooltip>
  </div>
}

