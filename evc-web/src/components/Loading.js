import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const Loading = props => {
  const { loading, message, children } = props;
  const loadingIndicator = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  return <Spin spinning={loading} indicator={loadingIndicator} tip={message} style={{width: '100%'}}>{children}</Spin>
}

Loading.propTypes = {
  loading: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

Loading.defaultProps = {
  loading: true,
};
