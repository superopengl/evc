// import 'App.css';
import { Menu, Dropdown } from 'antd';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeServiceArea from 'components/homeAreas/HomeServiceArea';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import { HomePricingArea } from 'components/homeAreas/HomePricingArea';
import CookieConsent from "react-cookie-consent";
import HomeMarketArea from 'components/homeAreas/HomeMarketArea';
import { withRouter } from 'react-router-dom';
import loadable from '@loadable/component'
import { GlobalContext } from 'contexts/GlobalContext';
import ProLayout from '@ant-design/pro-layout';
import Icon from '@ant-design/icons';
import { IoLanguage } from 'react-icons/io5';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

const StockGuestPreviewDrawer = loadable(() => import('components/StockGuestPreviewDrawer'));
const HomeEarningsCalendarArea = loadable(() => import('components/homeAreas/HomeEarningsCalendarArea'));
const HomeStockRadarArea = loadable(() => import('components/homeAreas/HomeStockRadarArea'));

const StyledLayout = styled(ProLayout)`
.ant-layout {
  background-color: white;
}

.ant-menu-item:hover {
  .ant-pro-menu-item-title {
    // color: white;
    // font-weight: 500;
  }
  // background-color: inherit;
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
  background-color: rgba(21,190,83,0.60);
  // background-color: rgba(255,255,255,0.6);
  // background-color: rgba(0, 41, 61, 0.6); 
}

.ant-pro-global-header-collapsed-button {
  color: rgba(255,255,255,0.75);
  color: rgba(0,0,0,0.75);
}

.ant-pro-menu-item-title {
  color: rgba(255,255,255,0.75);;
  color: rgba(0,0,0,0.75);;
  font-weight: 500;
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
  const intl = useIntl();

  const handleStockListSymbolClick = (symbol) => {
    setSelectedSymbol(symbol);
  }

  const handleLocaleChange = locale => {
    context.setLocale(locale);
  }

  const ROUTES = [
    {
      key: '0',
      path: '/#member',
      name: <FormattedMessage id="menu.proMember" />,
    },
    {
      key: '1',
      path: '/#stock-radar',
      name: <FormattedMessage id="menu.stockRadar" />,
    },
    {
      key: '2',
      path: '/#pricing',
      name: <FormattedMessage id="menu.pricing" />,
    },
    {
      path: '/signup',
      name: <FormattedMessage id="menu.signUp" />,
    },
    {
      path: '/login',
      name: <FormattedMessage id="menu.login" />,
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
    // logo="/favicon-32x32.png"
    logo="/images/logo-transparent.png"
    layout="top"
    navTheme="dark"
    route={{ routes: ROUTES }}
    location={{ pathname: '/non' }}
    fixedHeader={true}
    menuItemRender={(item, dom) => <div onClick={() => handleMenuClick(item.path)}>{dom}</div>}
    rightContentRender={props => {
      const menu = <Menu mode="horizontal" onClick={e => handleLocaleChange(e.key)}>
        <Menu.Item key="en-US">English</Menu.Item>
        <Menu.Item key="zh-CN">中 文</Menu.Item>
      </Menu>

      const dropdown = <Dropdown overlay={menu} trigger={['click']}>
        {/* <GlobalOutlined /> */}
        <Icon style={{ fontSize: 20, color: 'rgba(255,255,255,0.75)' }} component={() => <IoLanguage />} />
      </Dropdown>
      return props.collapsed ? <div style={{ display: 'flex', alignItems: 'center', }}>
        {dropdown}
      </div> : dropdown
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
  </StyledLayout>
}

HomePage.propTypes = {};

HomePage.defaultProps = {};

export default withRouter(HomePage);
