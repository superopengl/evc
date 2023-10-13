const CracoLessPlugin = require('craco-less');

const modifyVars = {
  '@primary-color': '#57BB60', // rgb(87,187,96)
  '@info-color': '#55B0D4', // rgb(85,176,212)
  '@link-color': '#55B0D4',
  '@success-color': '#57BB60',
  '@warning-color': '#fa8c16',
  '@error-color': '#d7183f', // rgb(215,24,63)
  '@layout-header-background': '#00293d',
  // '@font-family': "'klavika', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  // '@heading-color': '#00293d',
  // '@typography-title-font-weight': 400,
  '@font-size-base': '14px',
  // '@card-head-font-size': '18px',
  // '@height-base': '40px',
  // '@height-lg': '48px',
  // '@height-sm': '32px',
  '@border-radius-base': '4px',
  '@heading-1-size': 'ceil(@font-size-base * 2.0)',
  '@heading-2-size': 'ceil(@font-size-base * 1.8)',
  '@heading-3-size': 'ceil(@font-size-base * 1.6)',
  '@heading-4-size': 'ceil(@font-size-base * 1.4)',
};

// menu sider rgb(0, 41, 61)

module.exports = { 
  eslint: {
    enable: true,
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          // javascriptEnabled: true,
          // modifyVars,
          lessOptions: {
            javascriptEnabled: true,
            modifyVars,
          }
        }
      },
    },
  ],
};