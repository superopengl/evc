import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'util/withRouter';
import { Typography, Button, Form, Input, Divider } from 'antd';
import PropTypes from 'prop-types';
import { signUp } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import { notify } from 'util/notify';
import queryString from 'query-string';
import { FormattedMessage, useIntl } from 'react-intl';
const { Text } = Typography;

/**
 * The control stack is the same one /login uses, in the same order - Google, an "or" rule,
 * then the email field and one primary action - because the two pages sit side by side in the
 * nav and previously disagreed about it (signup put Google last and the "already a user" link
 * *above* the email field, where it read as the form's first control).
 *
 * showTitle is for the one caller that is not the /signup page: ProMemberPage opens this in a
 * modal that has no title of its own. On the page, AuthPageShell renders the heading.
 */
const SignUpForm = (props) => {

  const { onOk, showTitle = true } = props;

  const intl = useIntl();
  const [sending, setSending] = React.useState(false);
  const { code: referralCode } = queryString.parse(props.location.search);

  const handleSignIn = async (values) => {
    if (sending) {
      return;
    }

    try {
      setSending(true);

      Object.assign(values, { referralCode });

      await signUp(values);

      onOk();
      // Guest
      notify.success(
        '🎉 Successfully signed up!',
        <>Congratulations and thank you very much for signing up Easy Value Check. The invitation email has been sent out to <Text strong>{values.email}</Text>.</>
      );
    } catch {
      // Ignore error which will be handled by the http service.
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="evc-auth-form">
      {/* The same head AuthPageShell renders on /signup, in the same markup, so the modal on
          /pro-member gets the page's eyebrow + display heading + subtitle rather than a bare
          antd Title. `.evc-auth-card` styles all three; the shell owns them on the page, this
          owns them in the modal, and only one of the two ever renders. */}
      {showTitle && <div className="auth-head">
        <span className="evc-eyebrow auth-eyebrow">
          <FormattedMessage id="auth.signUpEyebrow" />
        </span>
        <h1 className="evc-display">
          <FormattedMessage id="auth.signUpTitle" />
        </h1>
        <p className="auth-subtitle">
          <FormattedMessage id="auth.signUpSubtitle" />
        </p>
      </div>}
      <GoogleSsoButton block referralCode={referralCode} />
      <Divider className="auth-divider" plain>
        <FormattedMessage id="text.or" />
      </Divider>
      <Form layout="vertical" onFinish={handleSignIn} requiredMark={false} initialValues={{ role: 'member' }}>
        <Form.Item
          label={<FormattedMessage id="placeholder.emailAddress" />}
          name="email"
          rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}
        >
          <Input
            size="large"
            placeholder={intl.formatMessage({ id: 'placeholder.emailAddress' })}
            type="email"
            autoComplete="email"
            allowClear={true}
            maxLength="100"
            autoFocus={true}
          />
        </Form.Item>
        <span className="auth-fine-print">
          <FormattedMessage
            id="text.byClickingAgreement"
            values={{
              tc: <a target="_blank" rel="noreferrer" href="/terms_and_conditions">
                <FormattedMessage id="menu.tc" />
              </a>,
              pp: <a target="_blank" rel="noreferrer" href="/privacy_policy">
                <FormattedMessage id="menu.pp" />
              </a>
            }}
          />
        </span>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button block size="large" type="primary" htmlType="submit" loading={sending} disabled={sending}>
            <FormattedMessage id="menu.signUp" />
          </Button>
        </Form.Item>
      </Form>
      <p className="auth-alt">
        <FormattedMessage
          id="auth.haveAccountPrompt"
          values={{ link: <Link to="/login"><FormattedMessage id="menu.login" /></Link> }}
        />
      </p>
    </div>
  );
}

SignUpForm.propTypes = {
  onOk: PropTypes.func.isRequired,
  showTitle: PropTypes.bool,
};

export default withRouter(SignUpForm);
