import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Typography, Input, Button, Form } from 'antd';
import { changePassword } from 'services/userService';
import HomeHeader from 'components/HomeHeader';
import { notify } from 'util/notify';
import { GlobalContext } from 'contexts/GlobalContext';

const ContainerStyled = styled.div`
  margin: 4rem auto 2rem auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 300px;
  width: 100%;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const { Title, Text } = Typography;
const ChangePasswordPage = props => {


  const [sending, setLoading] = React.useState(false);

  const goBack = () => {
    props.history.goBack();
  }

  const handleSubmit = async values => {
    if (sending) {
      return;
    }

    try {
      setLoading(true);
      const { password, newPassword } = values;

      await changePassword(password, newPassword);

      notify.success('Successfully changed password');

      // Go back to home page
      props.history.goBack();
    } catch (e) {
      setLoading(false);
    }
  }

  const validateConfirmPasswordRule = ({ getFieldValue }) => {
    return {
      async validator(value) {
        if (getFieldValue('newPassword') !== getFieldValue('confirmPassword')) {
          throw new Error('The confirm password does not match');
        }
      }
    }
  }


  return (
    <GlobalContext.Consumer>
      {
        context => {
          const { user } = context;

          return (
            <LayoutStyled>
              <HomeHeader></HomeHeader>
              <ContainerStyled>
                <Title level={2}>Change Password</Title>
                <Text code>{user.profile.email}</Text>
                <br />
                <br />
                <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
                  <Form.Item label="Old Password" name="password" rules={[{ required: true, message: ' ' }]}>
                    <Input.Password placeholder="Old Password" maxLength="50" autoComplete="current-password" disabled={sending} visibilityToggle={false} autoFocus={true} />
                  </Form.Item>
                  <Form.Item label="New Password (at least 8 letters)" name="newPassword" rules={[{ required: true, min: 8, message: ' ' }]}>
                    <Input.Password placeholder="New Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} />
                  </Form.Item>
                  <Form.Item label="Confirm New Password" name="confirmPassword" rules={[{ required: true, min: 8, message: ' ' }, validateConfirmPasswordRule]}>
                    <Input.Password placeholder="Confirm New Password" maxLength="50" autoComplete="new-password" disabled={sending} visibilityToggle={false} />
                  </Form.Item>
                  <Form.Item style={{ marginTop: '2rem' }}>
                    <Button block type="primary" htmlType="submit" disabled={sending}>Change Password</Button>
                  </Form.Item>
                  <Form.Item>
                    <Button block type="link" onClick={() => goBack()}>Cancel</Button>
                  </Form.Item>
                </Form>
              </ContainerStyled>
            </LayoutStyled>
          )
        }

      }
    </GlobalContext.Consumer>
  );
}

ChangePasswordPage.propTypes = {};

ChangePasswordPage.defaultProps = {};

export default withRouter(ChangePasswordPage);
