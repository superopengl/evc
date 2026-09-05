import React from 'react';
import PropTypes from 'prop-types';
import JavascriptTimeAgo from 'javascript-time-ago'
import { Space, Typography } from 'antd';
import en from 'javascript-time-ago/locale/en'
import ReactTimeAgo from 'react-time-ago'
import styled from 'styled-components';
import dayjs from 'util/dayjs';

JavascriptTimeAgo.addLocale(en);

const { Text } = Typography;

const StyledSpace = styled(Space)`
font-size: 0.8rem;

.ant-space-item {
  margin-bottom: 0 !important;
  line-height: 15px;
}
`

export const TimeAgo = props => {
  const { prefix, value, defaultContent, direction = 'vertical', strong = false, extra = null, accurate = true, showAgo = true, showTime = true, type = 'secondary', toNYTime = true } = props;
  if (!value) {
    return defaultContent || null;
  }
  let m = dayjs.utc(value);
  if(toNYTime) {
    m = m.tz('America/New_York');
  }
  return <StyledSpace size="small" orientation="horizontal">
    <Space orientation={direction} size="small">
      {prefix}
      {showAgo && <Text strong={strong} type={type}><ReactTimeAgo date={m.toDate()} /></Text>}
      {showTime && <Text strong={strong} type={type}>{m.format(accurate ? 'll HH:mm' : 'll')}</Text>}
    </Space>
    {extra}
  </StyledSpace>
}

TimeAgo.propTypes = {
  prefix: PropTypes.any,
  value: PropTypes.any,
  defaultContent: PropTypes.any,
  direction: PropTypes.string,
  extra: PropTypes.any,
  strong: PropTypes.bool,
  accurate: PropTypes.bool.isRequired,
  showAgo: PropTypes.bool,
  showTime: PropTypes.bool,
  type: PropTypes.oneOf([null, 'secondary']),
  toNYTime: PropTypes.bool
};

