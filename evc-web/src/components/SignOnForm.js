import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Form, Input, Checkbox, Layout, Divider } from 'antd';
import { signOn } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { notify } from 'util/notify';
const { Title, Text } = Typography;


const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  // max-width: 400px;
  // background-color: #f3f3f3;
`;



const SignOnForm = (props) => {

  const {onOk } = props;

  const [sending, setSending] = React.useState(false);


  const handleSignIn = async (values) => {
    if (sending) {
      return;
    }

    try {
      setSending(true);

      await signOn(values);

      onOk();
      // Guest
      notify.success(
        '🎉 Successfully signed up!',
        <>Congratulations and thank you very much for signing up Easy Value Check. The invitation email has been sent out to <Text strong>{values.email}</Text>.</>
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <ContainerStyled>
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
  );
}

SignOnForm.propTypes = {};

SignOnForm.defaultProps = {};

export default withRouter(SignOnForm);
