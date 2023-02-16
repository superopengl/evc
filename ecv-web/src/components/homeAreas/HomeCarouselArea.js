import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, Input } from 'antd';
import { withRouter } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { SearchOutlined } from '@ant-design/icons';
import SignOnForm from 'components/SignOnForm';

const { Title } = Typography;


const ContainerStyled = styled.div`
// border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0;
padding: 2rem auto;
width: 100%;
height: 100%;

`;

const SignInButton = styled(Button)`
// margin-top: 1rem;
max-width: 300px;
// height: 50px;
// border-radius: 30px;
// font-size: 1.3rem;
// border: 2px solid white;
`;


const PosterContainer = styled.div`
background-repeat: no-repeat;
background-size: cover;
background-position: center;
background-image: radial-gradient(rgba(0,0,0,0.8), rgba(0, 0, 0, 0.0)),url("images/poster.jpg");
width: 100%;
min-height: 200px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 1rem;
// padding-top: 40px;

.ant-typography {
  // color: rgba(255,255,255,1) !important;
  text-align: center;
}

`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const HomeCarouselAreaRaw = props => {

  const windowWidth = useWindowWidth();
  const context = useContext(GlobalContext);

  const isGuest = context.role === 'guest';

  const posterHeight = windowWidth < 576 ? 200 :
    windowWidth < 992 ? 250 :
      300;

  const catchPhraseSize = windowWidth < 576 ? 28 :
    windowWidth < 992 ? 36 :
      44;

  const handleSignIn = () => {
    props.history.push('/signon')
  }

  const handleSearch = async value => {

  }


  return (
    <ContainerStyled gutter={0} style={{ position: 'relative' }}>
          <Title style={{ fontSize: catchPhraseSize, marginLeft: 'auto', marginRight:'auto', textAlign:'center' }}>Easy Value Check</Title>
          {/* <Title level={2} style={{ marginTop: 0, fontWeight: 300, fontSize: Math.max(catchPhraseSize * 0.5, 14) }}>
            We are providing professional accounting and tax services to our clients including individuals, Sole traders, Partnerships, Companies, Trusts etc.
            You’ve got the skills and the experience. We’ve got diverse projects and meaningful work. Let’s take your career to the next level.
              </Title> */}

          <Row style={{ margin: '2rem auto 0' }}>
            <Col span={16}>
              <Input.Search
                size="large"
                enterButton={false}
                // prefix={<SearchOutlined />}
                placeholder="Search for symbols or companies"
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%', borderRadius: 24, paddingLeft: 20 }}
              />
            </Col>
            <Col span={8}>
              <SignOnForm />
            </Col>
          </Row>
    </ContainerStyled>
  );
}

HomeCarouselAreaRaw.propTypes = {};

HomeCarouselAreaRaw.defaultProps = {};

export const HomeCarouselArea = withRouter(HomeCarouselAreaRaw);

export default HomeCarouselArea;
