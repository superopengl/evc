import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form } from 'antd';
import { changePassword } from 'services/userService';
import { notify } from 'util/notify';

const ContainerStyled = styled.div`
  text-align: center;
  max-width: 300px;
  width: 100%;
`;


const ChangePasswordPage = () => {


  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async values => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const { password, newPassword } = values;

      await changePassword(password, newPassword);

      notify.success('Successfully changed password');
    } catch (e) {
      setLoading(false);
    }
  }

  const validateConfirmPasswordRule = ({ getFieldValue }) => {
    return {
      async validator() {
        if (getFieldValue('newPassword') !== getFieldValue('confirmPassword')) {
          throw new Error('The confirm password does not match');
        }
      }
    }
  }


  return (
    <ContainerStyled>
      <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
        <Form.Item label="Old Password" name="password" rules={[{ required: true, message: ' ' }]}>
          <Input.Password placeholder="Old Password" maxLength="50" autoComplete="current-password" disabled={loading} visibilityToggle={false} autoFocus={true} />
        </Form.Item>
        <Form.Item label="New Password (at least 8 letters)" name="newPassword" rules={[{ required: true, min: 8, message: ' ' }]}>
          <Input.Password placeholder="New Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
        </Form.Item>
        <Form.Item label="Confirm New Password" name="confirmPassword" rules={[{ required: true, min: 8, message: ' ' }, validateConfirmPasswordRule]}>
          <Input.Password placeholder="Confirm New Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
        </Form.Item>
        <Form.Item style={{ marginTop: '2rem' }}>
          <Button block type="primary" htmlType="submit" disabled={loading}>Change Password</Button>
        </Form.Item>
      </Form>
    </ContainerStyled>
  )
}

ChangePasswordPage.propTypes = {};

ChangePasswordPage.defaultProps = {};

export default withRouter(ChangePasswordPage);
