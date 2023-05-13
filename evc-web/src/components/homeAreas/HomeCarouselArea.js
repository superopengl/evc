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
import { LogoTextDark } from 'components/LogoTextDark';
import { SearchStockInput } from 'components/SearchStockInput';
import { getStockHistory, incrementStock } from 'services/stockService';
import HotStockList from 'components/HotStockList';

const { Title } = Typography;


const ContainerStyled = styled.div`
// border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0;
padding: 4rem 4px;
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

  const handleSignOn = () => {
    props.history.push('/signon')
  }

  const handleSearchChange = async symbol => {
    incrementStock(symbol);
    const data = await getStockHistory(symbol);
  }


  return (
    <ContainerStyled gutter={0} style={{ position: 'relative' }}>
      <Title style={{ fontSize: catchPhraseSize, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>Easy Value Check</Title>
      {/* <LogoTextDark /> */}
      {/* <Title level={2} style={{ marginTop: 0, fontWeight: 300, fontSize: Math.max(catchPhraseSize * 0.5, 14) }}>
        We are providing professional accounting and tax services to our clients including individuals, Sole traders, Partnerships, Companies, Trusts etc.
        You’ve got the skills and the experience. We’ve got diverse projects and meaningful work. Let’s take your career to the next level.
              </Title> */}
      <Space align="center" style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%', justifyContent: 'center' }} >
        <Button type="link" onClick={() => handleSignOn()}>Sign On with Email</Button>
        <GoogleSsoButton
          render={
            renderProps => (
              <Button
                ghost
                type="link"
                block
                icon={<GoogleLogoSvg size={16} />}
                // icon={<GoogleOutlined />}
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >Continue with Google</Button>
            )}
        />
      </Space>
      <div style={{ margin: '1rem auto', width: '100%', display: 'flex', justifyContent: 'center' }} >
        <SearchStockInput
          onChange={handleSearchChange}
        style={{ maxWidth: 500, width: '100%', borderRadius: 24, paddingLeft: 20 }}/>
      </div>
      <HotStockList size={10}/>
    </ContainerStyled>
  );
}

HomeCarouselAreaRaw.propTypes = {};

HomeCarouselAreaRaw.defaultProps = {};

export const HomeCarouselArea = withRouter(HomeCarouselAreaRaw);

export default HomeCarouselArea;
