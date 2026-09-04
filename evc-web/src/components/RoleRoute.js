import React from 'react';
import PropTypes from 'prop-types';
import OtherPage from 'pages/OtherPage';

/**
 * In react-router 5 this wrapped <Route> and swapped its `component`. v6 removed the `component`
 * prop and only accepts `path`/`element` on a <Route>, so this is now a plain guard rendered as
 * a route's element:
 *
 *   <Route path="/x" element={<RoleRoute visible={...} component={XPage} />} />
 */
export const RoleRoute = props => {
  const { visible = true, loading = false, component: Component, element } = props;

  if (loading) {
    return null;
  }
  if (!visible) {
    return <OtherPage />;
  }
  return element ?? <Component />;
};

RoleRoute.propTypes = {
  visible: PropTypes.bool,
  loading: PropTypes.bool
};
