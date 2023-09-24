const CracoLessPlugin = require('craco-less');

const modifyVars = {
  '@primary-color': '#15be53', // rgb(21,190,83)
  '@info-color': '#18b0d7',
  '@link-color': '#18b0d7',
  '@success-color': '#15be53',
  '@warning-color': '#fa8c16',
  '@error-color': '#d7183f', // rgb(215,24,63)
  '@layout-header-background': '#00293d',
  '@heading-color': '#00293d',
  '@font-size-base': '14px',
  // '@height-base': '40px',
  // '@height-lg': '48px',
  // '@height-sm': '32px',
  '@border-radius-base': '4px',
  '@heading-1-size': 'ceil(@font-size-base * 2.0)',
  '@heading-2-size': 'ceil(@font-size-base * 1.8)',
  '@heading-3-size': 'ceil(@font-size-base * 1.6)',
  '@heading-4-size': 'ceil(@font-size-base * 1.4)',
};

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