// import 'App.css';
import { Layout, Space, Button } from 'antd';
import { HashAnchorPlaceholder } from 'components/HashAnchorPlaceholder';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import { HomePricingArea } from 'components/homeAreas/HomePricingArea';
import CookieConsent from "react-cookie-consent";
import HomeMarketArea from 'components/homeAreas/HomeMarketArea';
import { StockGuestPreviewDrawer } from 'components/StockGuestPreviewDrawer';
import { Link, withRouter } from 'react-router-dom';
import { StockGuestStockRadarDrawer } from 'components/StockGuestStockRadarDrawer';
import {LocaleSelector} from 'components/LocaleSelector';

const { Content } = Layout;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

const ContentStyled = styled(Content)`
  margin: 0 auto 0 auto;
  width: 100%;
`;

const LogoPlate = styled.div`
margin: 4px 0 0;
padding: 8px;
// background-image: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.95), rgba(255,255,255,0.75));
// border-radius: 2px;
`;

const HeadMenu = styled(Space)`
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 1200px;
justify-content: space-between;
position: absolute;


.ant-select, .ant-btn-link {
  color: rgba(0,0,0,0.65) !important;

  .ant-select-arrow {
    color: rgba(0,0,0,0.65) !important;
  }
  &:hover {
    color: black !important;
  }
}

`;

const HomePage = (props) => {

  const [selectedSymbol, setSelectedSymbol] = React.useState();
  const [stockRadarVisible, setStockRadarVisible] = React.useState(false);

  const handleStockListSymbolClick = (symbol) => {
    setSelectedSymbol(symbol);
  }

  return (
    <LayoutStyled>
      {/* <BarStyled></BarStyled> */}
      <ContentStyled>
        <HashAnchorPlaceholder id="home" />
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <HeadMenu size="middle">
            <LogoPlate>
              <img alt="EasyValueCheck logo" src="/images/header-logo.png" width="auto"
                height="30"></img>
            </LogoPlate>
            <Space>
              <Button size="large" type="link" href="#pre">Pro Member</Button>
              <Button size="large" type="link" onClick={() => setStockRadarVisible(true)}>Stock Radar</Button>
              <Button size="large" type="link" href="#pricing">Pricing</Button>
              {/* <Link to="/signup"><Button size="large" type="link">Sign Up</Button></Link> */}
              <Link to="/login"><Button size="large" type="link">Login</Button></Link>
              <LocaleSelector bordered={false} style={{ color: 'white', width: 100 }} size="large" defaultValue="en-US" />
            </Space>
          </HeadMenu>
        </div>
        <section>
          <HomeCarouselArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
        </section>
        <HomeMarketArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
        <section id="pricing"><HomePricingArea /></section>
        {/* <section><HomeSearchArea /></section> */}
        <HashAnchorPlaceholder id="services" />
        <section><HomeServiceArea bgColor="#135200" /></section>
        {/* <HashAnchorPlaceholder id="team" /> */}
        {/* <section><HomeTeamArea /></section> */}
        <HomeFooter />
      </ContentStyled>
      <StockGuestStockRadarDrawer 
        visible={stockRadarVisible}
        onClose={() => setStockRadarVisible(false)}
        onSymbolClick={handleStockListSymbolClick}
      />
      <StockGuestPreviewDrawer
        symbol={selectedSymbol}
        visible={!!selectedSymbol}
        onClose={() => setSelectedSymbol()}
      />
      <CookieConsent location="bottom" overlay={false} expires={365} buttonStyle={{ borderRadius: 4 }} buttonText="Accept">
        We use cookies to improve your experiences on our website.
        </CookieConsent>
    </LayoutStyled>
  );
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default HomePage;
