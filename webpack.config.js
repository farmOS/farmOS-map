const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader' },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.BannerPlugin(`farmOS-map ${info.version}`),
    new MiniCssExtractPlugin({
      filename: 'farmOS-map.css',
      chunkFilename: 'farmOS-map-chunk-[contenthash].css',
    }),
    new CopyWebpackPlugin([
      { from: './examples/simple-html-consumer/static' },
    ]),
  ],
};
