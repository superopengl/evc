import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout, Divider } from 'antd';
import { Logo } from 'components/Logo';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';

const LayoutStyled = styled(Layout)`
margin: 0 auto 0 auto;
background-color: #ffffff;
height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 360px;
  min-width: 300px;
  background-color: #ffffff;
  height: 100%;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
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
    <LayoutStyled>
      <ContainerStyled>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={2}><FormattedMessage id="menu.login" /></Title>
        <GoogleSsoButton
          render={
            renderProps => (
              <Button
                ghost
                type="primary"
                block
                icon={<GoogleLogoSvg size={16} />}
                // icon={<GoogleOutlined />}
                style={{ marginTop: '1.5rem' }}
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >
                <FormattedMessage id="menu.continueWithGoogle"/>
                </Button>
            )}
        />
        <Divider>or</Divider>
        <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
          <Form.Item label="" name="name"
            rules={[{ required: true, validator: validateName, whitespace: true, max: 100, message: 'Please input valid email address' }]}
          >
            <Input placeholder={intl.formatMessage({id: "placeholder.emailAddress"})} type="email" autoComplete="email" allowClear={true} maxLength="100" disabled={sending} autoFocus={true} />
          </Form.Item>
          <Form.Item label="" name="password" autoComplete="current-password" rules={[{ required: true, message: 'Please input password' }]}>
            <Input.Password placeholder={intl.formatMessage({id: "placeholder.password"})} autoComplete="current-password" maxLength="50" disabled={sending} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={sending}><FormattedMessage id="menu.login" /></Button>
          </Form.Item>

          {/* <Form.Item>
            <Link to="/signup"><Button ghost block type="primary">Sign Up</Button></Link>
          </Form.Item> */}
          <Form.Item>
            <Link to="/forgot_password">
              <Button block type="link">
                <FormattedMessage id="text.forgotPasswordClickHereToReset"/>
              </Button>
            </Link>
            {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}
        <Link to="/signup"><Button size="small" block type="link">
        <FormattedMessage id="text.notAUserClickToSignUp"/>
          
          </Button></Link>
          </Form.Item>
        </Form>
      </ContainerStyled>
    </LayoutStyled>
  );
}

LogInPage.propTypes = {};

LogInPage.defaultProps = {};

export default withRouter(LogInPage);
