const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const info = require('./package.json');

module.exports = {
  entry: `${__dirname}/src/main.js`,
  output: {
    path: `${__dirname}/dist`,
    filename: 'farmOS-map.js',
    chunkFilename: 'farmOS-map-chunk-[contenthash].js',
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
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin(`farmOS-map ${info.version}`),
    new CopyWebpackPlugin([
      { from: './examples/simple-html-consumer/static' },
    ]),
  ],
};
