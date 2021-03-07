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
  const { paidOnly, message } = props;
  const context = React.useContext(GlobalContext);
  const { role } = context;
  const shouldBlock = paidOnly && !['admin', 'agent', 'member'].includes(role);

  const { children, ...otherProps } = props;
  const bodyStyle = shouldBlock ? {
    backgroundColor: 'rgb(0, 21, 41)',
    paddingLeft: 0,
    paddingRight: 0,
  } : {
      paddingLeft: 0,
      paddingRight: 0,
    };
  const headStyle = shouldBlock ?
    {
      backgroundColor: 'rgba(0, 21, 41, 0.8)',
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
      {shouldBlock ? <MemberOnlyPanel message={message} /> : children}
    </StyledCard>
  );
};

MemberOnlyCard.propTypes = {
  paidOnly: PropTypes.bool,
  message: PropTypes.string,
};

MemberOnlyCard.defaultProps = {
  paidOnly: false
}