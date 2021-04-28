const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const info = require('./package.json');

module.exports = {
  entry: `${__dirname}/src/main.js`,
  output: {
    path: `${__dirname}/dist`,
    filename: 'farmOS-map.js',
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin(`farmOS-map ${info.version}`),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'static' },
      ],
    }),
  ],
  externals: function ({context, request}, callback) {
    // Externalize all OpenLayers `ol` imports
    if (/^ol(\/.*)?$/.test(request)) {
      const modifiedRequest = request
        // Remove '.js' suffix - if present
        .replace(/\.js$/, "")
        // Replace filesystem separators '/' with module separators '.'
        .replace(/\//g, ".");
      return callback(null, modifiedRequest);
    }

    // Continue without externalizing the import
    callback();
  },
};
