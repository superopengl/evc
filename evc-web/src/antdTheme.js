/**
 * antd 5 dropped less variables, so the palette that used to live in craco.config.js
 * `modifyVars` is expressed as design tokens here and passed to <ConfigProvider theme>.
 *
 * The heading sizes preserve the old `ceil(@font-size-base * N)` overrides (base 14), which
 * are noticeably smaller than antd's stock 38/30/24/20.
 */
export const antdTheme = {
  token: {
    colorPrimary: '#57BB60',   // @primary-color / @success-color
    colorSuccess: '#57BB60',
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
    colorBgMenuItemSelected: '#57BB60',
    colorBgCollapsedButton: siderDarkBg,
    colorTextCollapsedButton: 'rgba(255, 255, 255, 0.65)',
    colorTextCollapsedButtonHover: '#ffffff',
  },
};

/**
 * The homepage sider only ever appears as the mobile drawer (`layout="top"` renders the menu
 * horizontally on desktop). pro-components 3 paints the sider panel from these tokens and
 * nothing else, so with no `token` prop at all the drawer came out fully transparent - the
 * menu items sat directly on top of whatever part of the page was scrolled behind them.
 *
 * Light, not the dark `proLayoutToken` above: the drawer opens under a #57BB60 header on a
 * white page, and a dark panel there would be the only dark surface on the marketing site.
 */
export const homeProLayoutToken = {
  sider: {
    colorMenuBackground: '#ffffff',
    colorTextMenu: 'rgba(6, 32, 46, 0.78)',
    colorTextMenuSecondary: 'rgba(6, 32, 46, 0.6)',
    colorTextMenuTitle: '#06202e',
    colorTextMenuActive: '#06202e',
    colorTextMenuItemHover: '#06202e',
    colorTextMenuSelected: '#06202e',
    colorTextSubMenuSelected: '#06202e',
    colorBgMenuItemHover: 'rgba(87, 187, 96, 0.1)',
    colorBgMenuItemSelected: 'rgba(87, 187, 96, 0.14)',
  },
};
