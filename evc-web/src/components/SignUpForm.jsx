import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { withRouter } from 'util/withRouter';
import { Typography, Button, Form, Input, Divider } from 'antd';
import { signUp } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { notify } from 'util/notify';
import queryString from 'query-string';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
const { Title, Text } = Typography;


const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  width: 100%;
`;

const SignUpForm = (props) => {

  const { onOk } = props;

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
    <ContainerStyled>
      <Title level={2}>
        <FormattedMessage id="menu.signUp"/>
      </Title>
      <Form layout="vertical" onFinish={handleSignIn} style={{ textAlign: 'left' }} initialValues={{ role: 'member' }}>
        <Form.Item>
          <Link to="/login"><Button size="small" block type="link">
            <FormattedMessage id="text.alreadyAUserClickToLogin"/>
            </Button></Link>
        </Form.Item>
        <Form.Item label="" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
          <Input placeholder={intl.formatMessage({id: 'placeholder.emailAddress'})} type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
        </Form.Item>
        {/* <Form.Item label="" name="agreement" valuePropName="checked" style={{ marginBottom: 0 }} rules={[{
          validator: (_, value) =>
            value ? Promise.resolve() : Promise.reject('You have to agree to continue.'),
        }]}>
          <Checkbox disabled={sending}>I have read and agree to the <a target="_blank" href="/terms_and_conditions">terms & conditions</a> and <a target="_blank" href="/privacy_policy">privacy policy</a>.</Checkbox>
        </Form.Item> */}
       <FormattedMessage id="text.byClickingAgreement" 
       values={{
         tc: <a target="_blank" href="/terms_and_conditions">
           <FormattedMessage id="menu.tc"/>
         </a>,
         pp: <a target="_blank" href="/privacy_policy">
           <FormattedMessage id="menu.pp"/>
         </a>
       }} 
       />
        <Form.Item style={{ marginTop: '1rem' }}>
          <Button block type="primary" htmlType="submit" disabled={sending}>
            <FormattedMessage id="menu.signUp" />
          </Button>
        </Form.Item>
        {/* <Form.Item>
                  <Button block type="link" onClick={() => goBack()}>Cancel</Button>
                </Form.Item> */}
      </Form>
      {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}
      <Divider><Text type="secondary"><small>or</small></Text></Divider>
      <GoogleSsoButton referralCode={referralCode} />
    </ContainerStyled>
  );
}

SignUpForm.propTypes = {};

export default withRouter(SignUpForm);
