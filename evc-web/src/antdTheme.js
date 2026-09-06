/**
 * antd 5 dropped less variables, so the palette that used to live in craco.config.js
 * `modifyVars` is expressed as design tokens here and passed to <ConfigProvider theme>.
 *
 * The heading sizes preserve the old `ceil(@font-size-base * N)` overrides (base 14), which
 * are noticeably smaller than antd's stock 38/30/24/20.
 */
export const antdTheme = {
  token: {
    colorPrimary: '#3f9e48',   // @primary-color / @success-color, darkened - see --evc-signal in index.less
    colorSuccess: '#3f9e48',
    colorInfo: '#55B0D4',      // @info-color
    colorLink: '#55B0D4',      // @link-color
    colorWarning: '#fa8c16',
    colorError: '#d7183f',
    fontSize: 14,              // @font-size-base
    borderRadius: 8,           // @border-radius-base
    fontSizeHeading1: 28,      // ceil(14 * 2.0)
    fontSizeHeading2: 26,      // ceil(14 * 1.8)
    fontSizeHeading3: 23,      // ceil(14 * 1.6)
    fontSizeHeading4: 20,      // ceil(14 * 1.4)

    // Kept in sync with the --evc-font-* custom properties in index.less. The
    // heading sizes above stay where they were: they are the old less overrides
    // and every admin screen is laid out around them. The homepage sets its own
    // display scale locally instead (components/homeAreas/HomeSection).
    fontFamily: "'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontFamilyCode: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    // antd defaults strong text to 600; Inter's 600 is the right weight for a
    // UI face, where the old system stack was effectively rendering 700.
    fontWeightStrong: 600,
    colorText: '#10222c',
    colorTextSecondary: '#5b7180',
    colorBorderSecondary: '#eef2f3',
  },
  components: {
    Layout: {
      headerBg: '#00293d',     // @layout-header-background
    },
    Table: {
      fontSize: 12,            // @table-font-size
    },
    Button: {
      fontWeight: 600,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
  },
};

/**
 * pro-components 3 dropped the `navTheme="dark"` sider (it only understands 'light' | 'realDark',
 * and 'realDark' darkens the whole app, not just the nav). The dark sider is a set of layout
 * design tokens passed to <ProLayout token={...}> instead. Colors mirror the old less palette:
 * @layout-header-background for the panel, @primary-color for the selected menu item.
 */
const siderDarkBg = '#00293d';

// Only the sider goes dark. The header stays on pro-layout's light default, which is what
// pro-layout 5's side layout did - the role-coloured avatar (admin is #00293d) is unreadable
// against a dark bar.
export const proLayoutToken = {
  sider: {
    colorMenuBackground: siderDarkBg,
    colorMenuItemDivider: 'rgba(255, 255, 255, 0.15)',
    colorTextMenu: 'rgba(255, 255, 255, 0.75)',
    colorTextMenuSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextMenuTitle: '#ffffff',
    colorTextMenuActive: '#ffffff',
    colorTextMenuItemHover: '#ffffff',
    colorTextMenuSelected: '#ffffff',
    colorTextSubMenuSelected: '#ffffff',
    colorBgMenuItemHover: 'rgba(255, 255, 255, 0.08)',
    colorBgMenuItemActive: 'rgba(255, 255, 255, 0.12)',
    colorBgMenuItemSelected: '#3f9e48',
    colorBgCollapsedButton: siderDarkBg,
    colorTextCollapsedButton: 'rgba(255, 255, 255, 0.65)',
    colorTextCollapsedButtonHover: '#ffffff',
  },
  /**
   * The content gutter, down from pro-components' default 40. Block padding is left alone.
   *
   * A token rather than a `.ant-pro-layout-content { padding-inline: 28px }` rule in
   * AppLoggedIn's StyledLayout, because pro-components emits the padding from this token and
   * zeroes it again under `-content-has-page-container` - a plain CSS override would put the
   * gutter back inside any page that renders a <PageContainer>, on top of the one the
   * PageContainer draws itself. Nothing in evc uses PageContainer today, so both routes look
   * identical on screen right now; this is the one that stays correct if something does.
   */
  pageContainer: {
    paddingInlinePageContainerContent: 28,
  },
};

/**
 * The homepage sider only ever appears as the mobile drawer (`layout="top"` renders the menu
 * horizontally on desktop). pro-components 3 paints the sider panel from these tokens and
 * nothing else, so with no `token` prop at all the drawer came out fully transparent - the
 * menu items sat directly on top of whatever part of the page was scrolled behind them.
 *
 * Dark, matching the nav it drops out of. It used to be light, from when the header was a
 * green slab over a white page; the homepage is ink now and a white drawer was the one light
 * surface on it that was not a data pane. The panel is painted by the drawer rules in
 * pages/HomePage - it needs a blur, which is not a token - so the background here stays
 * transparent and these only carry the menu.
 */
export const homeProLayoutToken = {
  sider: {
    colorMenuBackground: 'transparent',
    colorTextMenu: 'rgba(255, 255, 255, 0.72)',
    colorTextMenuSecondary: 'rgba(255, 255, 255, 0.6)',
    colorTextMenuTitle: '#ffffff',
    colorTextMenuActive: '#ffffff',
    colorTextMenuItemHover: '#ffffff',
    colorTextMenuSelected: '#ffffff',
    colorTextSubMenuSelected: '#ffffff',
    colorBgMenuItemHover: 'rgba(255, 255, 255, 0.08)',
    colorBgMenuItemSelected: 'rgba(87, 187, 96, 0.18)',
  },
};
