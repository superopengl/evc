import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import styled from 'styled-components';
import { MemberOnlyPanel } from 'components/MemberOnlyPanel';
import { GlobalContext } from 'contexts/GlobalContext';

const StyledCard = styled(Card)`
// margin-bottom: 30px;
`;

export const MemberOnlyCard = (props) => {
  const { paidOnly, message, children, blockedComponent, bodyStyle: propBodyStyle, ...otherProps } = props;
  const context = React.useContext(GlobalContext);
  const { role } = context;
  const shouldBlock = paidOnly && !['admin', 'agent', 'member'].includes(role);

  const bodyStyle = shouldBlock ? {
    ...propBodyStyle,
    overflow:'auto',
    backgroundColor: 'rgba(0, 41, 61, 0.1)',
  } : {
    ...propBodyStyle,
    overflow:'auto'
  };
  const headStyle = shouldBlock ?
    {
      // backgroundColor: 'rgba(0, 41, 61, 0.8)',
      // color: 'rgba(255,255,255,0.75)'
    } :
    {
      // backgroundColor: 'rgba(0, 41, 61, 0.1)',
      // backgroundColor: '#55B0D4',
      // color: 'rgba(255,255,255,0.75)'
      color: '#00293d'
    };
  return (
    <StyledCard size="middle"
      type="inner"
      bordered={false}
      {...otherProps}
      bodyStyle={bodyStyle}
      headStyle={headStyle}
    >
      {shouldBlock ? <div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <MemberOnlyPanel message={message} />{blockedComponent}
      </div> : children}
    </StyledCard>
  );
};

MemberOnlyCard.propTypes = {
  paidOnly: PropTypes.bool,
  message: PropTypes.string,
  blockedComponent: PropTypes.any,
};

MemberOnlyCard.defaultProps = {
  paidOnly: false
}