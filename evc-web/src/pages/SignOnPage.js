import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Modal, Form, Input, Checkbox, Layout, Divider } from 'antd';
import { Logo } from 'components/Logo';
import { signOn } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
const { Title } = Typography;

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  // background-color: #f3f3f3;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  // background-color: #f3f3f3;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const SignOnPage = (props) => {

  const [sending, setSending] = React.useState(false);


  const handleSignIn = async (values) => {
    if (sending) {
      return;
    }

    try {
      const { history } = props;
      setSending(true);

      // Sanitize pictures to imageIds
      values.role = values.isEmployee ? 'agent' : 'client';
      const user = await signOn(values);

      // Guest
      Modal.confirm({
        title: '🎉 Successfully signed up!',
        icon: null,
        content: <>
          <p>
            Congratulations and thank you very much for signing up Easy Value Check. The invitation email has been sent out. Please verify your email within 24 hours.
          </p>
        </>,
        onOk() {
          history.push('/');
        },
        okText: 'Go To log in',
        onCancel() {
          history.push('/');
        },
        cancelText: 'Go to home page'
      });
    } catch (e) {
      console.error(e);
      setSending(false);
    }
  }

  return (
    <GlobalContext.Consumer>{
      () => {

        return <LayoutStyled>
          <PageContainer>
            <ContainerStyled>
              <LogoContainer><Logo /></LogoContainer>
              <Title level={2}>Sign On</Title>

              <Link to="/login"><Button size="small" block type="link">Already a user? Click to log in</Button></Link>
              <Form layout="vertical" onFinish={handleSignIn} style={{ textAlign: 'left' }} initialValues={{ role: 'client' }}>
                <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
                  <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
                </Form.Item>
                <Form.Item label="" name="agreement" valuePropName="checked" style={{ marginBottom: 0 }} rules={[{
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
                }]}>
                  <Checkbox disabled={sending}>I have read and agree to the <a target="_blank" href="/terms_and_conditions">terms & conditions</a> and <a target="_blank" href="/privacy_policy">privacy policy</a>.</Checkbox>
                </Form.Item>
                <Form.Item style={{ marginTop: '1rem' }}>
                  <Button block type="primary" htmlType="submit" disabled={sending}>Sign On</Button>
                </Form.Item>
                {/* <Form.Item>
                  <Button block type="link" onClick={() => goBack()}>Cancel</Button>
                </Form.Item> */}
              </Form>
              {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}
              <Divider>or</Divider>
              <GoogleSsoButton
                render={
                  renderProps => (
                    <Button
                      ghost
                      type="primary"
                      block
                      icon={<GoogleLogoSvg size={16} />}
                      // icon={<GoogleOutlined />}
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                    >Continue with Google</Button>
                  )}
              />

            </ContainerStyled>
          </PageContainer>
        </LayoutStyled>;
      }
    }</GlobalContext.Consumer>

  );
}

SignOnPage.propTypes = {};

SignOnPage.defaultProps = {};

export default withRouter(SignOnPage);
