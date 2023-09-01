import { Typography, Tooltip } from 'antd';
import React from 'react';
import { LockFilled } from '@ant-design/icons';

const { Text } = Typography;

export const MemberOnlyIcon = () => <Tooltip title="Only accessible to paid user">
  <Text type="danger"><LockFilled /></Text>
</Tooltip>
