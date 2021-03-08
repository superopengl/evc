import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Typography, Card } from 'antd';
import styled from 'styled-components';
import { MemberOnlyPanel } from 'components/MemberOnlyPanel';
import { GlobalContext } from 'contexts/GlobalContext';


const { Text } = Typography;

const StyledCard = styled(Card)`
margin-bottom: 20px;
`;

export const MemberOnlyCard = (props) => {
  const { paidOnly, message, children, blockedComponent, ...otherProps } = props;
  const context = React.useContext(GlobalContext);
  const { role } = context;
  const shouldBlock = paidOnly && !['admin', 'agent', 'member'].includes(role);

  const bodyStyle = shouldBlock ? {
    backgroundColor: 'rgb(0, 41, 61)',
    paddingLeft: 0,
    paddingRight: 0,
  } : {
      paddingLeft: 0,
      paddingRight: 0,
    };
  const headStyle = shouldBlock ?
    {
      backgroundColor: 'rgba(0, 41, 61, 0.8)',
      color: 'rgba(255,255,255,0.75)'
    } :
    {
      backgroundColor: '#18b0d7',
      color: 'rgba(255,255,255,0.75)'
    };
  return (
    <StyledCard size="small"
      type="inner"
      bordered={false}
      {...otherProps}
      bodyStyle={bodyStyle}
      headStyle={headStyle}
    >
      {shouldBlock ? <><MemberOnlyPanel message={message} />{blockedComponent}</> : children}
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