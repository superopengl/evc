import React from 'react';
import { Button, Image } from 'antd';
import styled from 'styled-components';

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