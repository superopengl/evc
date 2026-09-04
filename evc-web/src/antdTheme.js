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
    borderRadius: 6,           // @border-radius-base
    fontSizeHeading1: 28,      // ceil(14 * 2.0)
    fontSizeHeading2: 26,      // ceil(14 * 1.8)
    fontSizeHeading3: 23,      // ceil(14 * 1.6)
    fontSizeHeading4: 20,      // ceil(14 * 1.4)
  },
  components: {
    Layout: {
      headerBg: '#00293d',     // @layout-header-background
    },
    Table: {
      fontSize: 12,            // @table-font-size
    },
  },
};
