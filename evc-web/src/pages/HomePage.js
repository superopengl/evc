// import 'App.css';
import { Menu, Dropdown } from 'antd';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import HomePricingArea from 'components/homeAreas/HomePricingArea';
import CookieConsent from "react-cookie-consent";
import HomeMarketArea from 'components/homeAreas/HomeMarketArea';
import { withRouter } from 'react-router-dom';
import loadable from '@loadable/component'
import { GlobalContext } from 'contexts/GlobalContext';
import ProLayout from '@ant-design/pro-layout';
import Icon from '@ant-design/icons';
import { IoLanguage } from 'react-icons/io5';
import { FormattedMessage } from 'react-intl';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

const StockGuestPreviewDrawer = loadable(() => import('components/StockGuestPreviewDrawer'));
const HomeUnusualOptionActivityArea = loadable(() => import('components/homeAreas/HomeUnusualOptionActivityArea'));
// const HomeEarningsCalendarArea = loadable(() => import('components/homeAreas/HomeEarningsCalendarArea'));
const HomeStockRadarArea = loadable(() => import('components/homeAreas/HomeStockRadarArea'));

const StyledLayout = styled(ProLayout)`
.ant-layout {
  background-color: white;
}

.ant-menu-item:hover {
  .ant-pro-menu-item-title {
    color: rgba(255,255,255, 0.7);
    // font-weight: 500;
  }
  background-color: transparent !important;
}

.ant-layout-content {
  margin: 0;
  position: absolute;
  top: 0;
  width: 100%;
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
  background-color: rgba(87,187,96,0.7);
  // background-color: rgba(255,255,255,0.6);
  // background-color: rgba(0, 41, 61, 0.6); 
// background-image: linear-gradient(125deg, #57BB60, #57BB60 90px, rgba(255,255,255,0.3) 90px, rgba(255,255,255,0.3) 100%);
}

.ant-pro-global-header-collapsed-button {
  // color: rgba(255,255,255,0.75);
  color: rgba(0,0,0,0.75);
}

.ant-pro-menu-item-title {
  // color: rgba(255,255,255,0.75);
  color: rgba(0,0,0,0.75);
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
  const [collapsed, setCollapsed] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const handleStockListSymbolClick = (symbol) => {
    setSelectedSymbol(symbol);
  }

  const handleLocaleChange = locale => {
    context.setLocale(locale);
  }

  const ROUTES = [
    {
      key: '0',
      path: '/pro-member',
      name: <FormattedMessage id="menu.proMember" />,
    },
    {
      key: '1',
      path: '/#stock-radar',
      name: <FormattedMessage id="menu.stockRadar" />,
    },
    {
      key: '2',
      path: '/#uoa',
      name: <FormattedMessage id="menu.unusualOptionsActivity" />,
    },
    // {
    //   key: '3',
    //   path: '/#earnings-calendars',
    //   name: <FormattedMessage id="menu.earningsCalendar" />,
    // },
    {
      key: '4',
      path: '/#pricing',
      name: <FormattedMessage id="menu.pricing" />,
    },
    {
      key: '5',
      path: '/signup',
      name: <FormattedMessage id="menu.signUp" />,
    },
    {
      key: '6',
      path: '/login',
      name: <FormattedMessage id="menu.login" />,
    }
  ];

  const handleMenuClick = (path) => {
    const isAnchor = path.includes('#');
    if (isAnchor) {
      scrollToElement(path.replace(/\//, ''));
      setCollapsed(true);
    } else {
      props.history.push(path);
    }
  }

  return <StyledLayout
    logo="/favicon-32x32.png"
    title={null}
    // logo="/images/logo-transparent.png"
    collapsed={collapsed}
    onCollapse={setCollapsed}
    siderWidth={270}
    layout="top"
    navTheme="dark"
    route={{ routes: ROUTES }}
    location={{ pathname: '/non' }}
    fixedHeader={true}
    menuItemRender={(item, dom) => {
      if(item.path === '/pro-member') {
        return <a href={item.path} target="_blank" rel="noreferrer">
          {dom}
        </a>
      }
      return <div onClick={() => item.handleClick ? item.handleClick() : handleMenuClick(item.path)}>
        {dom}
      </div>
    }}
    rightContentRender={props => {
      const menu = <Menu mode="horizontal" onClick={e => handleLocaleChange(e.key)}>
        <Menu.Item key="en-US">English</Menu.Item>
        <Menu.Item key="zh-CN">中 文</Menu.Item>
      </Menu>

      const dropdown = <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        {/* <GlobalOutlined /> */}
        <Icon style={{ fontSize: 20, color: 'rgba(0,0,0,0.75)' }} component={() => <IoLanguage />} />
      </Dropdown>
      return props.collapsed ? <div style={{ display: 'flex', alignItems: 'center', }}>
        {dropdown}
      </div> : dropdown
    }}
  >

    <section>
      <HomeCarouselArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
    </section>
    <section>
      <HomeMarketArea onSymbolClick={symbol => setSelectedSymbol(symbol)} />
    </section>
    <section id="stock-radar">
      <HomeStockRadarArea onSymbolClick={handleStockListSymbolClick} />
    </section>
    <section id="uoa">
      <HomeUnusualOptionActivityArea />
    </section>
    {/* <section id="earnings-calendars">
      <HomeEarningsCalendarArea onSymbolClick={handleStockListSymbolClick} />
    </section> */}
    <section id="pricing">
      <HomePricingArea />
    </section>
    {/* <section><HomeSearchArea /></section> */}
    {/* <section>
      <HomeServiceArea bgColor="#135200" />
    </section> */}

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
