import React from 'react';
import { Tooltip } from 'antd';
import { LockFilled } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';


export const LockIcon = () => <Tooltip title={<FormattedMessage id="text.fullFeatureAfterPay" />}>
  <LockFilled />
</Tooltip>;
