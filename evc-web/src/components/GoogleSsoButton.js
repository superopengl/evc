

import React from 'react';
import { withRouter } from 'react-router-dom';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle } from 'services/authService';
import { countUnreadMessage } from 'services/messageService';
import { GoogleLogin } from 'react-google-login';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';

const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser, setNotifyCount } = context;
  const {render, referralCode} = props;

  const handleGoogleSso = async (response) => {
    console.log('Google sso', response);
    const { tokenId, error } = response;
    if(error || !tokenId) {
      return;
    }
    const user = await ssoGoogle(tokenId, referralCode);
    if (user) {
      setUser(user);

      const count = await countUnreadMessage();
      setNotifyCount(count);
      
      const isClient = user.role === 'client';

      props.history.push('/');
    } else {
      notify.error('Failed to log in with Google');
    }
  }

  return <GoogleLogin
    clientId={process.env.REACT_APP_EVC_GOOGLE_SSO_CLIENT_ID}
    buttonText="Log In with Google"
    // isSignedIn={true}
    render={render}
    style={{width: '100%'}}
    icon={true}
    onSuccess={handleGoogleSso}
    onFailure={handleGoogleSso}
  // cookiePolicy={'single_host_origin'}
  />
}

GoogleSsoButton.propTypes = {
  referralCode: PropTypes.string,
};


export default withRouter(GoogleSsoButton);