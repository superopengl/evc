import React from 'react';
import { withRouter } from 'util/withRouter';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle } from 'services/authService';
import { GoogleLogin } from '@react-oauth/google';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';

/**
 * react-google-login wrapped Google's retired gapi platform library and was hard-capped at
 * React 17. @react-oauth/google speaks Google Identity Services instead.
 *
 * GIS only hands out the id_token that the backend decodes from its own rendered button, so the
 * previous `render` prop - a custom antd Button - has no equivalent. The theme/size/width props
 * below are the whole styling surface Google exposes.
 */
const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser } = context;
  const { referralCode, width } = props;

  const handleGoogleSso = async (response) => {
    const token = response?.credential;
    if (!token) {
      notify.error('Failed to log in with Google');
      return;
    }
    const user = await ssoGoogle(token, referralCode);
    if (user) {
      setUser(user);
      props.history.push('/');
    } else {
      notify.error('Failed to log in with Google');
    }
  };

  return <GoogleLogin
    onSuccess={handleGoogleSso}
    onError={() => notify.error('Failed to log in with Google')}
    text="continue_with"
    theme="outline"
    size="large"
    shape="rectangular"
    width={width}
  />;
};

GoogleSsoButton.propTypes = {
  referralCode: PropTypes.string,
  width: PropTypes.number,
};

export default withRouter(GoogleSsoButton);
