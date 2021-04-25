import React from 'react';
import { Image } from 'antd';

export const CardIcon = props => {
  return <Image src={props.src} preview={false} width={40}/>
}