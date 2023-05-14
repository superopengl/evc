import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Modal, Form, Input, Checkbox, Layout, Divider } from 'antd';
import { Logo } from 'components/Logo';
import { signOn } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import SignOnForm from 'components/SignOnForm';
const { Title, Text } = Typography;

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
      const user = await signOn(values);

      // Guest
      Modal.confirm({
        title: '🎉 Successfully signed up!',
        icon: null,
        content: <>
          <p>
            Congratulations and thank you very much for signing up Easy Value Check. The invitation email has been sent out to <Text strong>{values.email}</Text>. Please verify your email within 24 hours.
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
              <Logo />
              <SignOnForm onOk={() => props.history.push('/')} />
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
