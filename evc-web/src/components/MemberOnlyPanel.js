import React from 'react';
import { Space, Typography, Button } from 'antd';
import { LockFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";

const { Text } = Typography;

const StyledSpace = styled(Space)`
// font-size: 20px;
padding: 1rem;
color: rgba(255,255,255,0.75);
width: 100%;
justify-content: center;
align-items: center;

.ant-typography {
  color:rgba(255,255,255,0.75);
}

.anticon {
  font-size: 30px;
}
`;

export const MemberOnlyPanel = (props) => <StyledSpace direction="vertical">
  <LockFilled />
  <Text><i>{props.message}</i></Text>
  <Link to="/settings/subscription"><Button type="link">Click to upgrade</Button></Link>
</StyledSpace>

MemberOnlyPanel.propTypes = {
  message: PropTypes.string,
};

MemberOnlyPanel.defaultProps = {
  message: 'This information is only accessible to paid user'
};