import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, Dropdown, Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { GlobalOutlined, SearchOutlined } from '@ant-design/icons';
import SignOnForm from 'components/SignOnForm';
import { LogoTextDark } from 'components/LogoTextDark';
import { SearchStockInput } from 'components/SearchStockInput';
import { getStockHistory, incrementStock } from 'services/stockService';
import HotStockList from 'components/HotStockList';
import { LocaleSelector } from 'components/LocaleSelector';
import { HiOutlineTranslate } from 'react-icons/hi';

const { Title, Paragraph, Text } = Typography;


const Container = styled.div`
// border-bottom: 1px solid #f0f0f0;
// background: #092b00;
background-image: linear-gradient(#135200, #092b00);
margin: 0 auto 0;
padding: 0 4rem 64px;
width: 100%;
// height: 100%;
.signup-panel .ant-typography {
  color: rgba(255,255,255,0.85) !important;
}
`;

const InnerContainer = styled.div`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1200px;

.top-menu {
  .ant-select, .ant-btn-link {
    color: rgba(255,255,255,0.7) !important;

    .ant-select-arrow {
      color: rgba(255,255,255,0.7) !important;
    }
    &:hover {
      color: white !important;
    }
  }
}
`;

const SearchPanel = styled(Space)`
background: rgba(255,255,255,0.8);
padding: 20px;
border-radius: 4px;
margin: auto
`;

const LogoPlate = styled.div`
margin: 4px 0 0;
padding: 8px;
background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.95), rgba(255,255,255,0.75));
border-radius: 2px;
`;

const HomeCarouselAreaRaw = props => {

  const windowWidth = useWindowWidth();
  const context = useContext(GlobalContext);

  const isGuest = context.role === 'guest';

  const posterHeight = windowWidth < 576 ? 300 :
    windowWidth < 992 ? 350 :
      400;

  const catchPhraseSize = windowWidth < 576 ? 28 :
    windowWidth < 992 ? 36 :
      44;

  const handleSignOn = () => {
    props.history.push('/signup')
  }

  const handleSearchChange = async symbol => {
    const data = await getStockHistory(symbol);
  }

  const span = {
    xs: 24,
    sm: 24,
    md: 12,
    lg: 12,
    xl: 12,
    xxl: 12
  };

  return (
    <Container>
      <InnerContainer>
        <Space className="top-menu" size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <LogoPlate>
          <img alt="EasyValueCheck logo" src="/images/header-logo.png" width="auto" 
          height="24"></img>

          </LogoPlate>

          <Space>
            <Link to="/signup"><Button size="large" type="link">Sign Up</Button></Link>
            <Link to="/login"><Button size="large" type="link">Login</Button></Link>
            <LocaleSelector bordered={false} style={{ color: 'white', width: 110 }} size="large" defaultValue="en-US" />
          </Space>
        </Space>
        <Row gutter={20} style={{ marginTop: 100 }}>
          <Col className="signup-panel" {...span} style={{ textAlign: 'center' }}>
            <Title style={{ fontSize: catchPhraseSize, marginLeft: 'auto', marginRight: 'auto' }}>Easy Value Check</Title>
            <Paragraph level={3} style={{ fontSize: catchPhraseSize * 0.5, marginLeft: 'auto', marginRight: 'auto' }}>Easy Value Check provides top class invstiment guidence to earn more money on the market! Go go go! Sign up today!</Paragraph>
            <Space align="center" style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%', justifyContent: 'center' }} >
              <Button type="primary" onClick={() => handleSignOn()}>Sign Up with Email</Button>
              <GoogleSsoButton
                render={
                  renderProps => (
                    <Button
                      type="secondary"
                      block
                      icon={<GoogleLogoSvg size={16} />}
                      // icon={<GoogleOutlined />}
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled}
                    >Continue with Google</Button>
                  )}
              />
            </Space>
          </Col>
          <Col {...span} style={{ textAlign: 'center' }}>
            <SearchPanel direction="vertical" >
              <SearchStockInput
                onChange={handleSearchChange}
                style={{ maxWidth: 500, width: '100%' }} />
              <Text>Most Searched</Text>
              <HotStockList size={10} />
            </SearchPanel>
          </Col>
        </Row>

        {/* <LogoTextDark /> */}
        {/* <Title level={2} style={{ marginTop: 0, fontWeight: 300, fontSize: Math.max(catchPhraseSize * 0.5, 14) }}>
        We are providing professional accounting and tax services to our clients including individuals, Sole traders, Partnerships, Companies, Trusts etc.
        You’ve got the skills and the experience. We’ve got diverse projects and meaningful work. Let’s take your career to the next level.
              </Title> */}

      </InnerContainer>
    </Container>
  );
}

HomeCarouselAreaRaw.propTypes = {};

HomeCarouselAreaRaw.defaultProps = {};

export const HomeCarouselArea = withRouter(HomeCarouselAreaRaw);

export default HomeCarouselArea;
