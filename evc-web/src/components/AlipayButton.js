import React from 'react';
import { Button, Image } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { useStripe, Elements } from '@stripe/react-stripe-js';
import styled from 'styled-components';
import Icon from '@ant-design/icons';

const StyledButton = styled(Button)`
border-color: #108fe9;
// background-color: white;
// color: white;

&:active, &:focus, &:hover {
  // color:  #108fe9;
  background: #108fe933;
  border-color:  #108fe9;
}
`;

export const AlipayButton = (props) => {
  const { children, style, ...otherProps } = props;
  return <StyledButton
    block
    type="secondary"
    size="large"
    style={{ fontWeight: 700, fontStyle: 'italic', ...style }}
    {...otherProps}>
    <Image src="images/AlipayLogo.svg" height={28} width="auto" preview={false}/>
  </StyledButton>
}