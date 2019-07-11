const webpack = require('webpack');

module.exports = {
  entry: './main.js',
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
};
