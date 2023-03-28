const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const info = require('./package.json');

module.exports = {
  entry: `${__dirname}/src/main.js`,
  output: {
    path: `${__dirname}/dist`,
    filename: 'nfa-map.js',
    chunkFilename: 'nfa-map-chunk-[contenthash].js',
    clean: true,
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
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `nfa-map ${info.version}`,
      entryOnly: true,
    }),
    new MiniCssExtractPlugin({
      filename: 'nfa-map.css',
      chunkFilename: 'nfa-map-chunk-[contenthash].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './examples/simple-html-consumer/static' },
      ],
    }),
  ],
};
