// import 'App.css';
import { Layout } from 'antd';
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


const { Content } = Layout;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

const ContentStyled = styled(Content)`
  margin: 0 auto 0 auto;
  width: 100%;
`;


const HomePage = (props) => {

  const [selectedSymbol, setSelectedSymbol] = React.useState();

  return (
    <LayoutStyled>
      {/* <BarStyled></BarStyled> */}
      <ContentStyled>
        <HashAnchorPlaceholder id="home" />
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
      <StockGuestPreviewDrawer
        symbol={selectedSymbol}
        visible={!!selectedSymbol}
        onClose={() => setSelectedSymbol()}
      />
      <CookieConsent location="top" overlay expires={999} buttonStyle={{ borderRadius: 4 }} buttonText="I understand">
        This website uses cookies to enhance the user experience.
        </CookieConsent>
    </LayoutStyled>
  );
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default HomePage;
