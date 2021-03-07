import React, {Suspense} from 'react';
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
  const { paidOnly } = props;
  const context = React.useContext(GlobalContext);
  const { role } = context;
  const shouldBlock = paidOnly && !['admin', 'agent', 'member'].includes(role);

  const { children, ...otherProps } = props;
  const bodyStyle = shouldBlock ? { backgroundColor: 'rgb(0, 21, 41)' } : {};
  const headStyle = shouldBlock ? { backgroundColor: 'rgba(0, 21, 41, 0.8)', color: 'rgba(255,255,255,0.75)' } : {};
  return (
    <StyledCard size="small" type="inner" {...otherProps} bodyStyle={bodyStyle} headStyle={headStyle}>
      {shouldBlock ? <MemberOnlyPanel /> : children}
    </StyledCard>
  );
};

MemberOnlyCard.propTypes = {
  paidOnly: PropTypes.bool
};

MemberOnlyCard.defaultProps = {
  paidOnly: false
}