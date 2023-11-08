import React from 'react';
import { Typography, Button } from 'antd';
import { LockFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";
import { GlobalContext } from 'contexts/GlobalContext';
import { FormattedMessage } from 'react-intl';

const { Text } = Typography;

const StyledSpace = styled.div`
display: flex;
flex-direction: column;
// font-size: 20px;
padding: 16px;
// color: rgba(255,255,255,0.65);
width: 100%;
justify-content: center;
align-items: center;
text-align: center;

.ant-typography {
  // color:rgba(255,255,255,0.65);
}

// .anticon {
//   font-size: 30px;
// }
`;

export const MemberOnlyPanel = (props) => {
  const context = React.useContext(GlobalContext)
  const isGuest = context.role === 'guest';

return <StyledSpace>
  <LockFilled />
  <Text>{props.message}</Text>
  {isGuest && <Link to="/signup">
    <Button type="link">
      Click to Sign Up
      </Button>
  </Link>}
  {!isGuest && <Link to="/settings/subscription">
    <Button type="link">
      Click to upgrade
      </Button>
  </Link>}
</StyledSpace>}

MemberOnlyPanel.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

MemberOnlyPanel.defaultProps = {
  message: <FormattedMessage id="text.fullFeatureAfterPay" />
};