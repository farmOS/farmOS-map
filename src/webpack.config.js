const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: __dirname + '/main.js',
  output: {
    path: __dirname + '/build',
    filename: 'farmOS-map.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'static' }
    ])
  ]
};
