// import 'App.css';
import { Menu, Dropdown, Button } from 'antd';
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

/**
 * One backdrop for the whole page, rather than a background per section.
 *
 * The page used to be a stack of bands - white, pale mint, white, pale cyan - and every
 * boundary between them was a horizontal line the eye had to cross. It read as a document.
 * This is a single continuous field instead: the hero's four bands at the top, then ink all
 * the way down to the footer.
 *
 * Ink rather than a pale tint, and the same ink the auth pages stand on (see INK_BG in
 * components/homeAreas/HomeSection): the data panels floating on it are light, so the page
 * reads the way /login does - a bright card on a dark ground - instead of as one long white
 * sheet. A pale version of this was tried first and it just made the whole page washy.
 *
 * The two hues moving through it are the hero's own #57BB60 and #55B0D4 at 10-18%, off-canvas
 * so they read as light in the room rather than as shapes. Percentages are of the whole
 * content column, so they drift a little as the data sections grow; nothing here has to line
 * up with a particular section, which is why the stops are far apart.
 */
const PAGE_BACKDROP = [
  'radial-gradient(1500px 900px at 88% 8%, rgba(87, 187, 96, 0.2), transparent 60%)',
  'radial-gradient(1300px 850px at 0% 26%, rgba(85, 176, 212, 0.16), transparent 60%)',
  'radial-gradient(1400px 900px at 100% 48%, rgba(87, 187, 96, 0.14), transparent 60%)',
  'radial-gradient(1300px 850px at 0% 70%, rgba(85, 176, 212, 0.16), transparent 60%)',
  'radial-gradient(1200px 800px at 92% 88%, rgba(87, 187, 96, 0.12), transparent 60%)',
  ['linear-gradient(180deg,',
    '#06202e 0%,',
    '#013246 16%,',
    '#063045 40%,',
    '#013246 62%,',
    '#00293d 84%,',
    '#001e2e 100%)'].join(' '),
].join(', ');

const StyledLayout = styled(ProLayout)`
.ant-layout {
  background-color: #06202e;
}

// pro-components 3 gutters the content with padding (32px 40px) where pro-layout 5
// used margin, so zeroing the margin alone no longer makes the page full-bleed.
.ant-layout-content {
  margin: 0;
  padding: 0;
  position: absolute;
  top: 0;
  width: 100%;
  background: ${PAGE_BACKDROP};
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

// The bar stands on the page's own gutter, not on pro-layout's.
//
// pro-components hard-codes both edges, differently, and only the leading one: 16px of
// margin-inline on the mobile ant-pro-global-header, 16px of padding-inline-start on the
// desktop ant-pro-top-nav-header-main, and nothing at all on the trailing side - the actions
// slot runs to the viewport edge, and the only thing keeping the Sign Up button off it is the
// 2px + 6px of hover padding around the last actions item. So on a phone the hamburger sat
// 16px in, the Sign Up pill 24px in, and the cards below them 18px in: three different
// margins down one edge, with the bar's two not even matching each other.
//
// Both edges are --evc-gutter now, the same variable every section below uses (index.less),
// so the hamburger, the logo tile and the Sign Up button land on the content column at every
// width - including the wide end, where the gutter opens to 40px and the bar used to stay
// pinned at 16.
//
// This costs the horizontal menu ~64px at the desktop end, which moves the width where the
// last items fall behind the "..." overflow from ~1060px to ~1100px. That is the width the
// 13px item padding below was already tuned for, so nothing new collapses on a laptop.
//
// The -8px cancels that hover padding on the last item. It is the button's fill the eye
// aligns to, not the invisible box around it, so without this the pill stops 8px short of
// the gutter while the hamburger opposite it sits on the line.
.ant-pro-global-header,
.ant-pro-top-nav-header-main {
  margin: 0;
  padding-inline: var(--evc-gutter);
}

.ant-pro-global-header-header-actions > *:last-child {
  margin-inline-end: -8px;
}

// The bar is glass, not paint. It used to be a flat #57BB60 slab - the logo tile's green -
// which meant the first 56px of the page hid the top of the hero's four-colour gradient
// behind a fifth, unrelated green. Translucent ink lets the gradient run to the very top of
// the viewport and read through the bar, and it is the same navy the page settles into below
// the hero, so the chrome belongs to the page at every scroll position. A white bar was tried
// first: correct over the hero, a bright strip across the top of a dark page everywhere else.
//
// Both selectors are needed: pro-components renders ant-pro-top-nav-header on desktop and a
// plain ant-pro-global-header below the lg breakpoint, and the wrapping ant-layout-header
// carries an inline background-color: transparent that only !important can beat.
.ant-layout-header,
.ant-pro-global-header,
.ant-pro-global-header-layout-top,
.ant-pro-top-nav-header {
  background-color: rgba(4, 25, 37, 0.55) !important;
  backdrop-filter: var(--evc-glass-blur);
  -webkit-backdrop-filter: var(--evc-glass-blur);
}

// The blur is on the inner nodes as well as the wrapper, but only the wrapper draws the
// edge - otherwise the hairline is painted three times and comes out as a 3px grey band.
.ant-layout-header {
  border-block-end: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 8px 28px rgba(0, 8, 14, 0.18);
}

.ant-pro-global-header-collapsed-button {
  color: var(--evc-on-ink);
  transition: color 0.15s ease;

  &:hover {
    color: var(--evc-signal-lift);
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
  box-shadow: 8px 0 32px rgba(0, 8, 14, 0.45);
}

// Dark, like the bar it drops out of. It was a light panel from when the header was a green
// slab over a white page; against the ink nav and the ink page it was the only light surface
// on the site that was not a data pane.
// !important because antd 6 emits .ant-drawer-content { background: colorBgElevated } from
// its own CSS-in-JS, which is injected after this block and wins on order at equal
// specificity - the panel came out white with white menu labels on it.
.ant-drawer-content, .ant-drawer-body, .ant-pro-sider {
  background-color: rgba(4, 25, 37, 0.94) !important;
  backdrop-filter: var(--evc-glass-blur);
  -webkit-backdrop-filter: var(--evc-glass-blur);
}

.ant-drawer-body {
  padding: 0;
}

// ProLayout hangs the sider's collapse toggle off the panel's *outer* edge
// (inset-inline-start: calc(100% - 11px)), which is where a desktop sider wants it - half on
// the sider, half on the page. Inside the mobile drawer that edge is a clipping boundary, so
// all that survives is the inner sliver of a white disc pinned to the seam: it reads as a
// rendering fault rather than as a control.
//
// Hidden rather than repositioned. The drawer is dismissed by tapping the dimmed page, which
// is what a nav drawer on a phone is expected to do, and this toggle is the only thing in the
// panel that would have to be styled and given a row of its own to earn its place.
//
// No media query needed: layout="top" renders no sider on desktop, so this element only ever
// exists inside the drawer below the lg breakpoint.
.ant-pro-sider-collapsed-button {
  display: none;
}

.ant-menu-item, .ant-menu-submenu {
  &::after {
    display: none !important;
  }
}

// Light at rest, the lifted green on hover, on the dark glass bar.
//
// Scoped to .ant-menu-horizontal on purpose: the same <Menu> is re-rendered vertically inside
// the mobile drawer. That copy is dark too, but it is coloured by the sider tokens in
// antdTheme's homeProLayoutToken - one layer per menu, so retuning the bar cannot silently
// repaint the drawer with hover colours sized for a horizontal row.
//
// The class to colour is the <li>, not ant-pro-menu-item-title - that class is pro-layout 5
// and does not exist in pro-components 3, which emits ant-pro-base-menu-horizontal-item-*
// instead. The children below inherit rather than being listed one by one, so a future
// rename of those internals cannot silently drop the colour again.
.ant-menu-horizontal {
  // Tighter than antd's 20px inline padding: six items plus the two auth buttons is a lot of
  // bar, and this is what keeps them all out of the overflow menu down to ~1100px.
  > .ant-menu-item, > .ant-menu-submenu {
    padding-inline: 13px;
  }

  &.ant-menu, .ant-menu-item, .ant-menu-submenu-title {
    color: var(--evc-on-ink-muted);
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
    color: var(--evc-signal-lift) !important;
  }

  // The current item is full white - green here would read as permanently hovered.
  .ant-menu-item-selected {
    color: var(--evc-on-ink);
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
  color: var(--evc-on-ink);
  transition: color 0.15s ease;

  &:hover {
    color: var(--evc-signal-lift);
  }
}
`;

/**
 * The Log In / Sign Up pair in the header's actions slot.
 *
 * Log In is a text button and Sign Up is the filled one: on a dark bar a single green fill is
 * the only thing that reads as "start here", and giving both a fill would cancel that out.
 *
 * Both survive at every width: on a phone the bar is only carrying a hamburger, the logo tile
 * and the language switcher, so there is room, and Log In is not in the drawer.
 */
const NavAuth = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-inline-start: 4px;

  .ant-btn {
    height: 34px;
    padding-inline: 16px;
    border-radius: 10px;
    font-size: 13.5px;
  }

  .nav-login {
    color: var(--evc-on-ink);

    &:hover {
      color: var(--evc-on-ink) !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }
  }

  .nav-signup {
    box-shadow: 0 6px 18px rgba(0, 8, 14, 0.35);
  }

  @media (max-width: 575px) {
    .ant-btn {
      height: 32px;
      padding-inline: 13px;
      font-size: 13px;
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


  /**
   * The destinations, in the order they were always in. Sign Up and Log In used to be here
   * too, rendered as menu links indistinguishable from navigation, which is the one thing
   * that changed: they are buttons in the actions slot now (see actionsRender), because they
   * are the page's two actions rather than two more places to go.
   */
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
    // No navTheme: pro-components 3 only understands 'light' | 'realDark', so navTheme="dark"
    // was silently ignored. The dark bar and drawer are the tokens below plus the CSS above.
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
    // selectedKeys: [] because nothing in this menu is a "current page" - the homepage is all
    // of them. Without it pro-layout resolves '/' against '/#pricing' and paints Pricing as
    // the active item, which reads as though the visitor is already on a pricing page.
    //
    // The popup class is for antd's own horizontal overflow menu: between the lg breakpoint
    // and about 1200px the last items collapse behind a "..." trigger, and that panel is
    // portalled to body where the dark bar's styling cannot reach it. Coloured in index.less.
    menuProps={{
      selectedKeys: [],
      // classNames.popup.root is antd 6's hook for submenu flyouts, but the overflow rest menu
      // is built by rc-menu and only reads overflowedIndicatorPopupClassName. Both are set;
      // this menu has no submenus today, so it is the second one doing the work.
      classNames: { popup: { root: 'evc-home-menu-popup' } },
      overflowedIndicatorPopupClassName: 'evc-home-menu-popup',
    }}
    // pro-components 3 dropped rightContentRender; actionsRender is its replacement for the
    // top layout and takes an array of nodes. Log In and Sign Up live here rather than in the
    // menu: they are the page's two actions, and one of them is the primary call to action on
    // the whole site, which a text link in a row of nav items cannot say.
    actionsRender={() => {
      // `items` rather than children: antd 6 deprecates Menu children. No mode either - it
      // used to be "horizontal", which antd rejects for a Dropdown's Menu ("mode=horizontal
      // is not supported for Dropdown's Menu"); a dropdown popup wants the default vertical
      // list, which is also the ordinary shape for a language picker.
      const menu = <Menu
        onClick={e => handleLocaleChange(e.key)}
        items={[
          { key: 'en-US', label: 'English' },
          { key: 'zh-CN', label: '中 文' },
        ]}
      />

      return [
        <Dropdown key="locale" popupRender={() => menu} trigger={['click']} placement="bottomRight">
          <Icon style={{ fontSize: 19, color: 'inherit' }} component={() => <IoLanguage />} />
        </Dropdown>,
        <NavAuth key="auth">
          <Button className="nav-login" type="text" onClick={() => props.history.push('/login')}>
            <FormattedMessage id="menu.login" />
          </Button>
          <Button className="nav-signup" type="primary" onClick={() => props.history.push('/signup')}>
            <FormattedMessage id="menu.signUp" />
          </Button>
        </NavAuth>,
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
      buttonStyle={{ borderRadius: 8, margin: '10px 0 10px 16px', padding: '9px 22px', background: '#3f9e48', color: '#ffffff', fontSize: 13, fontWeight: 600 }}
      buttonText="Accept"
    >
      We use cookies to improve your experiences on our website.
    </CookieConsent>
  </StyledLayout>
}

HomePage.propTypes = {};

export default withRouter(HomePage);
