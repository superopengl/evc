import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { withRouter } from 'util/withRouter';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle } from 'services/authService';
import { GoogleLogin } from '@react-oauth/google';
import { notify } from 'util/notify';

/**
 * Google Identity Services renders its button as real DOM (`div[role=button]`), not in an
 * iframe - the only iframe it creates is a hidden 0x0 transport - so the sizing and border
 * it ships with can be brought in line with the antd buttons it sits next to. Out of the box
 * it is a 4px radius, a #dadce0 hairline and Google Sans 500, against antd's 8px radius and
 * Inter 600, which read as two different controls wherever they are paired.
 *
 * The mark, the wordmark and the label all stay as Google renders them; only the frame and
 * the label's face change.
 */
const Styled = styled.div`
  display: ${props => (props.$block ? 'block' : 'inline-flex')};
  width: ${props => (props.$block ? '100%' : 'auto')};

  /* GIS emits its own hashed classes and no stable hook, so these are the class names it
     ships. They have been stable for the life of the library; if a future version renames
     them the button falls back to Google's stock styling rather than breaking. */
  .nsm7Bb-HzV7m-LgbsSe {
    width: ${props => (props.$block ? '100% !important' : 'auto')};
    max-width: none;
    height: 40px;
    border-radius: 8px;
    border-color: var(--evc-line);
    box-shadow: none;
    transition: border-color 0.18s ease, background-color 0.18s ease;

    &:hover, &:focus {
      border-color: var(--evc-text-faint);
      background-color: var(--evc-paper);
      box-shadow: none;
    }
  }

  .nsm7Bb-HzV7m-LgbsSe .nsm7Bb-HzV7m-LgbsSe-BPrWId {
    font-family: var(--evc-font-body);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.005em;
    color: var(--evc-text);
  }
`;

/**
 * react-google-login wrapped Google's retired gapi platform library and was hard-capped at
 * React 17. @react-oauth/google speaks Google Identity Services instead.
 *
 * GIS only hands out the id_token that the backend decodes from its own rendered button, so the
 * previous `render` prop - a custom antd Button - has no equivalent. The theme/size/width props
 * below are the whole styling surface Google exposes; anything past that is the CSS above.
 */
const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser } = context;
  const { referralCode, width, block = false } = props;

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

  return <Styled $block={block}>
    <GoogleLogin
      onSuccess={handleGoogleSso}
      onError={() => notify.error('Failed to log in with Google')}
      text="continue_with"
      theme="outline"
      size="large"
      shape="rectangular"
      width={width}
    />
  </Styled>;
};

GoogleSsoButton.propTypes = {
  referralCode: PropTypes.string,
  width: PropTypes.number,
  block: PropTypes.bool,
};

export default withRouter(GoogleSsoButton);
