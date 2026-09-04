import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import OtherPage from 'pages/OtherPage';

export const RoleRoute = props => {
  const { visible = true, loading = false, component, ...otherProps } = props;
  return <Route {...otherProps} component={loading ? null : visible ? component : OtherPage} />
}

RoleRoute.propTypes = {
  visible: PropTypes.bool,
  loading: PropTypes.bool
};

