import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { useGoogleLogin } from '@react-oauth/google';
import { withRouter } from 'util/withRouter';
import { GlobalContext } from '../contexts/GlobalContext';
import { ssoGoogle } from 'services/authService';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { notify } from 'util/notify';

/**
 * This is an ordinary antd Button that starts Google's OAuth 2.0 authorization-code flow in a
 * popup. It is deliberately NOT `<GoogleLogin>`, i.e. not the button Google renders itself.
 *
 * Google's rendered button could not be made to match the controls it sits next to, and the
 * reason is structural rather than a CSS problem worth more effort:
 *
 * - **It personalizes itself and there is no way to stop it.** With an approved Google session
 *   it becomes "Continue as <name>" with the account's avatar, email and an account-chooser
 *   chevron. Google documents exactly three ways to suppress that - icon-only type, size
 *   `medium`/`small`, or a width under 200px - and every one of them is a button that no longer
 *   matches a 40px full-width control. There is no `personalized: false`.
 * - **On production it is a cross-origin iframe.** Chrome serves the FedCM variant there, so the
 *   painted button lives inside `accounts.google.com/gsi/button`. Its radius, border and
 *   typography are unreachable by design, and the frame deliberately bleeds past its own box
 *   (`margin: -2px -10px`), which is why it also refused to line up with the fields.
 *
 * Localhost gets a *different* rendering path from production - real in-page DOM, non-FedCM,
 * non-personalized - so the old button looked correct locally and wrong on prod. That is worth
 * remembering before "fixing" anything here against a local screenshot.
 *
 * The cost of owning the button is that the popup returns an authorization code rather than an
 * id_token, so `ssoGoogle` on the API redeems it with Google server-side. That is strictly
 * better than what it replaced: the old handler ran `jwt.decode()`, which verifies nothing, so
 * a forged JWT was accepted as proof of identity.
 */
const GoogleSsoButton = props => {
  const context = React.useContext(GlobalContext);
  const { setUser } = context;
  const { referralCode, width, block = false } = props;

  const [sending, setSending] = React.useState(false);

  const handleAuthCode = async response => {
    const code = response?.code;
    if (!code) {
      notify.error('Failed to log in with Google');
      return;
    }

    try {
      setSending(true);
      const user = await ssoGoogle(code, referralCode);
      if (user) {
        setUser(user);
        props.history.push('/');
      } else {
        notify.error('Failed to log in with Google');
      }
    } finally {
      setSending(false);
    }
  };

  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: handleAuthCode,
    // Closing the popup raises onError with no error code. That is a deliberate cancel, not a
    // failure, so it must not raise a toast.
    onError: error => {
      if (error?.error) {
        notify.error('Failed to log in with Google');
      }
    },
  });

  return <Button
    block={block}
    size="large"
    icon={<GoogleLogoSvg size={18} />}
    loading={sending}
    disabled={sending}
    onClick={() => login()}
    // A caller that passes an explicit `width` is sizing this against a sibling button; `block`
    // lets the container do it. The radius comes from `.evc-auth-form` on the auth screens and
    // from the theme everywhere else, so it is not restated here.
    styles={width ? { root: { width } } : undefined}
  >
    <FormattedMessage id="button.continueWithGoogle" />
  </Button>;
};

GoogleSsoButton.propTypes = {
  referralCode: PropTypes.string,
  width: PropTypes.number,
  block: PropTypes.bool,
};

export default withRouter(GoogleSsoButton);
