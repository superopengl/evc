import React from 'react';
import { Space, Typography, Button } from 'antd';
import { LockFilled } from '@ant-design/icons';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";

const { Text } = Typography;

const StyledSpace = styled.div`
display: flex;
flex-direction: column;
// font-size: 20px;
padding: 16px;
color: rgba(255,255,255,0.65);
width: 100%;
justify-content: center;
align-items: center;
text-align: center;

.ant-typography {
  color:rgba(255,255,255,0.65);
}

.anticon {
  font-size: 30px;
}
`;

export const MemberOnlyPanel = (props) => <StyledSpace>
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