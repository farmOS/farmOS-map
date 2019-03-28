const webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: {
    path: __dirname + '/build',
    filename: 'farmOS-map.js'
  },
};
