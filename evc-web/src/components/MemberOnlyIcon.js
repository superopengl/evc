import { Tooltip } from 'antd';
import React from 'react';
import { LockFilled } from '@ant-design/icons';

export const MemberOnlyIcon = () => <Tooltip title="Only accessible to paid user">
  <LockFilled />
</Tooltip>
