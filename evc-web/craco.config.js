const CracoLessPlugin = require('craco-less');
const path = require('path');

// menu sider rgb(0, 41, 61)

module.exports = {
  eslint: {
    enable: true,
  },
  webpack: {
    alias: {
      // @antv/g2plot (pulled in by @ant-design/charts) reaches G2 v4, whose @antv/adjust
      // declares tslib ^1.10.0 while its build emits __spreadArray - a helper that only exists
      // from tslib 2.1, so the bundle fails to resolve it. tslib 2 is a superset of the v1
      // helpers, so pointing every bundled module at one copy is safe.
      tslib: path.resolve(__dirname, 'node_modules/tslib'),
    },
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
          }
        }
      },
    },
  ],
};