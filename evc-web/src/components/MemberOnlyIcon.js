import { Typography, Tooltip } from 'antd';
import React from 'react';
import { LockFilled } from '@ant-design/icons';

const { Text } = Typography;

export const MemberOnlyIcon = () => <Tooltip title="Only accessible to paid user">
  <LockFilled />
</Tooltip>
