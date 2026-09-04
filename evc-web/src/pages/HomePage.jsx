// import 'App.css';
import { Menu, Dropdown } from 'antd';
import HomeCarouselArea from 'components/homeAreas/HomeCarouselArea';
import HomeFooter from 'components/HomeFooter';
import React from 'react';
import styled from 'styled-components';
import HomePricingArea from 'components/homeAreas/HomePricingArea';
import CookieConsent from "react-cookie-consent";
import HomeMarketArea from 'components/homeAreas/HomeMarketArea';
import { withRouter } from 'util/withRouter';
import loadable from '@loadable/component'
import { GlobalContext } from 'contexts/GlobalContext';
import { ProLayout } from '@ant-design/pro-components';
import Icon from '@ant-design/icons';
import { IoLanguage } from 'react-icons/io5';
import { FormattedMessage, useIntl } from 'react-intl';
import smoothscroll from 'smoothscroll-polyfill';
import { ContactWidget } from 'components/ContactWidget';
import { scrollToElement } from '../util/scrollToElement';
import { trackGuestUserVisit } from '../util/trackGuestUserVisit';
import HomeOptionPutCallArea from 'components/homeAreas/HomeOptionPutCallArea';
import { APP_TITLE, createPageTitleRender } from 'util/pageTitle';
import { homeProLayoutToken } from 'antdTheme';

smoothscroll.polyfill();

const StockGuestPreviewDrawer = loadable(() => import('components/StockGuestPreviewDrawer'));
const HomeUnusualOptionActivityArea = loadable(() => import('components/homeAreas/HomeUnusualOptionActivityArea'));
// const HomeEarningsCalendarArea = loadable(() => import('components/homeAreas/HomeEarningsCalendarArea'));
const HomeStockRadarArea = loadable(() => import('components/homeAreas/HomeStockRadarArea'));

const StyledLayout = styled(ProLayout)`
.ant-layout {
  background-color: white;
}

// pro-components 3 gutters the content with padding (32px 40px) where pro-layout 5
// used margin, so zeroing the margin alone no longer makes the page full-bleed.
.ant-layout-content {
  margin: 0;
  padding: 0;
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

.ant-pro-top-nav-header-logo {
  h1 {
    display: none;
  }
}

.ant-pro-top-nav-header-main {
  margin: auto;
}

// #57BB60 is the exact green of the logo tile, so the mark sits on the bar without a seam.
// It used to be rgba(87,187,96,0.7), which let whatever was underneath tint it - a different
// green over the hero than over the white boards further down.
// Both selectors are needed: pro-components renders ant-pro-top-nav-header on desktop and a
// plain ant-pro-global-header below the lg breakpoint, and the wrapping ant-layout-header
// carries an inline background-color: transparent that only !important can beat.
.ant-layout-header,
.ant-pro-global-header,
.ant-pro-global-header-layout-top,
.ant-pro-top-nav-header {
  background-color: #57bb60 !important;
}

.ant-layout-header {
  border-block-end: 1px solid rgba(6, 32, 46, 0.08);
  box-shadow: 0 1px 3px rgba(6, 32, 46, 0.08);
}

.ant-pro-global-header-collapsed-button {
  color: #000000;
  transition: color 0.15s ease;

  &:hover {
    color: #ffffff;
  }
}

// Mobile drawer. ProLayout renders it as an *inline* drawer, so it stacks inside the layout
// rather than over the viewport - and the ant-layout-content override above makes the page a
// positioned element, which painted the whole page on top of the drawer's mask. Fixed
// positioning takes the drawer out of that contest so the mask actually dims the page.
.ant-drawer.ant-drawer-inline {
  position: fixed;
  z-index: 1001;
}

.ant-drawer-content-wrapper {
  box-shadow: 8px 0 32px rgba(6, 32, 46, 0.18);
}

.ant-drawer-body {
  background-color: #ffffff;
  padding: 0;
}

.ant-menu-item, .ant-menu-submenu {
  &::after {
    display: none !important;
  }
}

// Black at rest, white on hover, on the #57BB60 bar.
//
// Scoped to .ant-menu-horizontal on purpose: the same <Menu> is re-rendered vertically inside
// the mobile drawer, which is white, and a white hover there would be invisible.
//
// The class to colour is the <li>, not ant-pro-menu-item-title - that class is pro-layout 5
// and does not exist in pro-components 3, which emits ant-pro-base-menu-horizontal-item-*
// instead. The children below inherit rather than being listed one by one, so a future
// rename of those internals cannot silently drop the colour again.
.ant-menu-horizontal {
  &.ant-menu, .ant-menu-item, .ant-menu-submenu-title {
    color: #000000;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.005em;
    transition: color 0.15s ease;
  }

  .ant-menu-item, .ant-menu-item-selected, .ant-menu-submenu {
    background-color: transparent !important;
  }

  // !important, and matched as a direct child, because antd's own hover rule is
  // ant-menu-light > ant-menu-item:not(.ant-menu-item-selected):hover - four class
  // selectors, so it outranks a plain descendant rule and repaints the label back to
  // colorText. That :not() is why this looked half-broken rather than broken: the selected
  // item is the one case antd does not claim, so Pricing went white and nothing else did.
  > .ant-menu-item:hover,
  > .ant-menu-submenu:hover > .ant-menu-submenu-title {
    color: #ffffff !important;
  }

  // The current item stays black - white here would read as permanently hovered.
  .ant-menu-item-selected {
    color: #000000;
    font-weight: 600;
  }

  // The label is four elements deep inside the <li>. These have to track the <li> in every
  // state, so the inherit is !important too - otherwise the same antd rules that beat the
  // hover colour above can pin a child back to colorText.
  .ant-menu-title-content,
  .ant-menu-title-content a,
  .ant-pro-base-menu-horizontal-item-title,
  .ant-pro-base-menu-horizontal-item-text,
  .ant-pro-base-menu-horizontal-item-icon {
    color: inherit !important;
  }
}

// Language switcher, in the header's actions slot rather than the menu.
.ant-pro-global-header-header-actions-item {
  color: #000000;
  transition: color 0.15s ease;

  &:hover {
    color: #ffffff;
  }
}
`;

const HomePage = (props) => {
  const intl = useIntl();
  const pageTitleRender = React.useMemo(() => createPageTitleRender(intl), [intl]);

  const [selectedSymbol, setSelectedSymbol] = React.useState();
  const [collapsed, setCollapsed] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const handleStockListSymbolClick = (symbol) => {
    setSelectedSymbol(symbol);
  }

  const handleLocaleChange = locale => {
    context.setLocale(locale);
  }

  const isGuest = context.role === 'guest';

  React.useEffect(() => {
    if (isGuest) {
      trackGuestUserVisit();
    }
  }, []);


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
      key: '7',
      path: '/#option',
      name: <FormattedMessage id="menu.optionPutCall" />,
    },
    {
      key: '2',
      path: '/#uoa',
      name: <FormattedMessage id="menu.unusualOptionsActivity" />,
    },
    {
      key: '3',
      path: '/earnings_calendar_preview',
      name: <FormattedMessage id="menu.earningsCalendar" />,
    },
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
    title={APP_TITLE}
    pageTitleRender={pageTitleRender}
    // logo="/images/logo-transparent.png"
    collapsed={collapsed}
    onCollapse={setCollapsed}
    siderWidth={270}
    layout="top"
    breakpoint="lg"
    navTheme="dark"
    token={homeProLayoutToken}
    route={{ routes: ROUTES }}
    location={{ pathname: '/' }}
    fixedHeader={true}
    menuItemRender={(item, dom) => {
      if (['/pro-member', '/earnings_calendar_preview'].includes(item.path)) {
        return <a href={item.path} target="_blank" rel="noreferrer">
          {dom}
        </a>
      }
      return <div onClick={() => item.handleClick ? item.handleClick() : handleMenuClick(item.path)}>
        {dom}
      </div>
    }}
    // pro-components 3 dropped rightContentRender; actionsRender is its replacement for the
    // top layout and takes an array of nodes.
    actionsRender={() => {
      const menu = <Menu mode="horizontal" onClick={e => handleLocaleChange(e.key)}>
        <Menu.Item key="en-US">English</Menu.Item>
        <Menu.Item key="zh-CN">中 文</Menu.Item>
      </Menu>

      return [
        <Dropdown key="locale" popupRender={() => menu} trigger={['click']} placement="bottomRight">
          <Icon style={{ fontSize: 19, color: 'inherit' }} component={() => <IoLanguage />} />
        </Dropdown>
      ];
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
    <section id="option">
      <HomeOptionPutCallArea />
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

    {isGuest && <ContactWidget />}

    <HomeFooter />

    <StockGuestPreviewDrawer
      symbol={selectedSymbol}
      visible={!!selectedSymbol}
      onClose={() => setSelectedSymbol()}
    />
    <CookieConsent
      location="bottom"
      overlay={false}
      expires={365}
      style={{ alignItems: 'center', padding: '10px 24px', background: 'rgba(6, 32, 46, 0.96)', backdropFilter: 'blur(8px)', fontSize: 13 }}
      buttonStyle={{ borderRadius: 8, margin: '10px 0 10px 16px', padding: '9px 22px', background: '#57BB60', color: '#ffffff', fontSize: 13, fontWeight: 600 }}
      buttonText="Accept"
    >
      We use cookies to improve your experiences on our website.
    </CookieConsent>
  </StyledLayout>
}

HomePage.propTypes = {};

export default withRouter(HomePage);
