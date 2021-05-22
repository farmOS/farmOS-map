const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SaveRemoteFilePlugin = require('save-remote-file-webpack-plugin');

const info = require('./package.json');

module.exports = {
  entry: {
    'farmOS-map': {
      'import': `${__dirname}/src/main.js`,
      library: {
        name: ['farmOS', 'map'],
        type: 'global',
        'export': 'default',
      },
    },
  },
  output: {
    path: `${__dirname}/dist`,
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      // Setting this to 1MB rather than the default of 50KB to avoid
      // Random vendor chunks being generated
      enforceSizeThreshold: 1024 * 1024,
    },
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
    new SaveRemoteFilePlugin([
      {
          url: 'https://raw.githubusercontent.com/openlayers/openlayers.github.io/master/en/v6.5.0/build/ol.js',
          filepath: 'ol.js',
          hash: false,
      },
      {
        url: 'https://raw.githubusercontent.com/openlayers/openlayers.github.io/master/en/v6.5.0/css/ol.css',
        filepath: 'ol.css',
        hash: false,
      },
    ]),
    new CopyWebpackPlugin({
      patterns: [
        { from: './examples/simple-html-consumer/static' },
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
