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
import { Link, withRouter } from 'react-router-dom';
import { LocaleSelector } from 'components/LocaleSelector';
import loadable from '@loadable/component'
import { getDefaultLocale } from 'util/getDefaultLocale';
import { GlobalContext } from 'contexts/GlobalContext';
import ProLayout from '@ant-design/pro-layout';

const StockGuestPreviewDrawer = loadable(() => import('components/StockGuestPreviewDrawer'));
const HomeEarningsCalendarArea = loadable(() => import('components/homeAreas/HomeEarningsCalendarArea'));
const HomeStockRadarArea = loadable(() => import('components/homeAreas/HomeStockRadarArea'));

const { Header, Content } = Layout;

const StyledLayout = styled(ProLayout)`
.ant-layout {
  background-color: white;
}

.ant-layout-content {
  margin: 0;
  position: absolute;
  top: 0;
}

.ant-pro-top-menu {
  background: transparent !important;
}

.ant-pro-top-nav-header-logo, .ant-pro-top-nav-header-main-left {
  min-width: 0;
}

.ant-pro-top-nav-header-main {
  margin: auto;
  // max-width: 1200px;
}

.ant-pro-global-header-layout-top, .ant-pro-top-nav-header {
  // background-color: rgba(255,255,255,0.6);
  background-color: rgba(0, 41, 61, 0.6); 
}

.ant-pro-global-header-collapsed-button {
  color: rgba(255,255,255,0.85);
}

.ant-pro-menu-item-title {
  color: rgba(255,255,255,0.85);;
  font-weight: 400;
}

.anticon {
  color: white;
}
`;

const LayoutStyled = styled(Layout)`
  margin: 0;
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

const scrollToElement = (selector) => {
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: "start",
    inline: "nearest"
  });
}



const HomePage = (props) => {

  const [selectedSymbol, setSelectedSymbol] = React.useState();
  const context = React.useContext(GlobalContext);

  const handleStockListSymbolClick = (symbol) => {
    setSelectedSymbol(symbol);
  }

  const handleLocaleChange = locale => {
    context.setLocale(locale);
  }

  const ROUTES = [
    {
      path: '/#member',
      name: 'Pro Member',
    },
    {
      path: '/#stock-radar',
      name: 'Stock Radar',
    },
    {
      path: '/#pricing',
      name: 'Pricing',
    },
    {
      path: '/signup',
      name: 'Sign Up',
    },
    {
      path: '/login',
      name: 'Log In',
    }
  ];

  const handleMenuClick = (path) => {
    const isAnchor = path.includes('#');
    if (isAnchor) {
      scrollToElement(path.replace(/\//, ''))
    } else {
      props.history.push(path);
    }
  }

  return <StyledLayout
    title={null}
    logo="/favicon-32x32.png"
    layout="top"
    navTheme="dark"
    route={{ routes: ROUTES }}
    location={{ pathname: '/non' }}
    fixedHeader={true}
    menuItemRender={(item, dom) => <div onClick={() => handleMenuClick(item.path)}>{dom}</div>}
    rightContentRender={props => {
      let style = {
        color: 'white', 
        width: 100, 
        textAlign: 'right'
      };
      if(props.collapsed) {
        style = {
          ...style,
          display: 'flex', 
          alignItems: 'center',
        }
      }
      return <LocaleSelector bordered={false} style={style} defaultValue={getDefaultLocale()} onChange={handleLocaleChange} />
    }}
  >
    <section>
      <HomeCarouselArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
    </section>
    <HomeMarketArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
    <section id="pricing">
      <HomePricingArea />
    </section>
    {/* <section><HomeSearchArea /></section> */}
    <section>
      <HomeServiceArea bgColor="#135200" />
    </section>
    <section id="stock-radar">
      <HomeStockRadarArea onSymbolClick={handleStockListSymbolClick} />
    </section>
    <section id="earnings-calendars">
      <HomeEarningsCalendarArea onSymbolClick={handleStockListSymbolClick} />
    </section>
    <HomeFooter />

    <StockGuestPreviewDrawer
      symbol={selectedSymbol}
      visible={!!selectedSymbol}
      onClose={() => setSelectedSymbol()}
    />
    <CookieConsent location="bottom" overlay={false} expires={365} buttonStyle={{ borderRadius: 4 }} buttonText="Accept">
      We use cookies to improve your experiences on our website.
        </CookieConsent>
    {/* <ProLayout.Footer
  copyright="2019 蚂蚁金服体验技术部出品"
  links={[
    {
      key: 'Ant Design Pro',
      title: 'Ant Design Pro',
      href: 'https://pro.ant.design',
      blankTarget: true,
    },
    {
      key: 'github',
      href: 'https://github.com/ant-design/ant-design-pro',
      blankTarget: true,
    },
    {
      key: 'Ant Design',
      title: 'Ant Design',
      href: 'https://ant.design',
      blankTarget: true,
    },
  ]}
/> */}
  </StyledLayout>

  return (
    <LayoutStyled>
      {/* <BarStyled></BarStyled> */}
      <Header>
        <HashAnchorPlaceholder id="home" />
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <HeadMenu size="middle">
            <LogoPlate>
              <img alt="EasyValueCheck logo" src="/images/header-logo.png" width="auto"
                height="30"></img>
            </LogoPlate>
            <Space>
              <Button size="large" type="link" href="#pre">Pro Member</Button>
              <Button size="large" type="link" onClick={() => scrollToElement('#stock-radar')}>Stock Radar</Button>
              <Button size="large" type="link" onClick={() => scrollToElement('#pricing')}>Pricing</Button>
              {/* <Link to="/signup"><Button size="large" type="link">Sign Up</Button></Link> */}
              <Link to="/login"><Button size="large" type="link">Login</Button></Link>
              <LocaleSelector bordered={false} style={{ color: 'white', width: 100 }} size="large" defaultValue={getDefaultLocale()} onChange={handleLocaleChange} />
            </Space>
          </HeadMenu>
        </div>

      </Header>
      <ContentStyled>
        <section>
          <HomeCarouselArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
        </section>
        <HomeMarketArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
        <section id="pricing">
          <HomePricingArea />
        </section>
        {/* <section><HomeSearchArea /></section> */}
        <section>
          <HomeServiceArea bgColor="#135200" />
        </section>
        <section id="stock-radar">
          <HomeStockRadarArea onSymbolClick={handleStockListSymbolClick} />
        </section>
        <section id="earnings-calendars">
          <HomeEarningsCalendarArea onSymbolClick={handleStockListSymbolClick} />
        </section>
        {/* <HashAnchorPlaceholder id="team" /> */}
      </ContentStyled>
      {/* <Footer style={{padding: 0}}>
        <HomeFooter />
      </Footer> */}
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

export default withRouter(HomePage);
