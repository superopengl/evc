import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'util/withRouter';
import { Input, Button, Form, Divider } from 'antd';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import AuthPageShell from 'components/AuthPageShell';
import { FormattedMessage, useIntl } from 'react-intl';

const LogInPage = props => {
  const [sending, setLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const intl = useIntl();
  const { setUser } = context;

  const validateName = async (rule, value) => {
    const isValid = value && isEmail(value);
    if (!isValid) {
      throw new Error();
    }
  }

  const handleSubmit = async values => {
    if (sending) {
      return;
    }

    try {
      setLoading(true);

      const user = await login(values.name, values.password);
      setUser(user);

      props.history.push('/');
    } catch {
      setLoading(false);
    }
  }

  return (
    <AuthPageShell
      eyebrow={<FormattedMessage id="menu.login" />}
      title={<FormattedMessage id="auth.loginTitle" />}
      subtitle={<FormattedMessage id="auth.loginSubtitle" />}
    >
      {/* Google first, then the email form: it is one click against four, and putting it
          under the form buried the path most returning users take. */}
      <GoogleSsoButton block />
      <Divider className="auth-divider" plain>
        <FormattedMessage id="text.or" />
      </Divider>
      <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          label={<FormattedMessage id="placeholder.emailAddress" />}
          name="name"
          rules={[{ required: true, validator: validateName, whitespace: true, max: 100, message: 'Please input valid email address' }]}
        >
          <Input
            size="large"
            placeholder={intl.formatMessage({ id: 'placeholder.emailAddress' })}
            type="email"
            autoComplete="email"
            allowClear={true}
            maxLength="100"
            disabled={sending}
            autoFocus={true}
          />
        </Form.Item>
        <Form.Item
          label={<FormattedMessage id="placeholder.password" />}
          name="password"
          rules={[{ required: true, message: 'Please input password' }]}
        >
          <Input.Password
            size="large"
            placeholder={intl.formatMessage({ id: 'placeholder.password' })}
            autoComplete="current-password"
            maxLength="50"
            disabled={sending}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button block size="large" type="primary" htmlType="submit" loading={sending} disabled={sending}>
            <FormattedMessage id="menu.login" />
          </Button>
        </Form.Item>
        <Link className="auth-secondary" to="/forgot_password">
          <FormattedMessage id="text.forgotPasswordClickHereToReset" />
        </Link>
      </Form>
      <p className="auth-alt">
        <FormattedMessage
          id="auth.noAccountPrompt"
          values={{ link: <Link to="/signup"><FormattedMessage id="menu.signUp" /></Link> }}
        />
      </p>
    </AuthPageShell>
  );
}

LogInPage.propTypes = {};

export default withRouter(LogInPage);
