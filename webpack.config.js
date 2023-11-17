'use strict';

const path = require('path')
const htmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack');
const packageinfo = require('./package.json')

module.exports = {
  entry: {
    'ads':path.join(__dirname, './src/js/index.js')
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js'
  },
  mode:'development',
  devServer: {
    open: true,
    host:'127.0.0.1',
    port: 9000,
    contentBase: path.join(__dirname, 'src')
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.join(__dirname, './src/index.html'),
      filename: 'index.html',
      chunks:['ads']
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          drop_debugger: true,
          drop_console: false
        }
      },
      sourceMap: false,
      parallel:true
    }),
    new webpack.DefinePlugin({
      SDK_VERSION: JSON.stringify(packageinfo.version)
    }),
    new webpack.BannerPlugin(`package version:${packageinfo.version}`)
  ],
  module: {
    rules: [
      // css
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      // babel
      { test: /\.js$/, use: 'babel-loader', exclude: /node_modules/ },
      // file
      { test: /\.(ttf|eot|svg|woff(2))(\?[a-z0-9]+)?$/, loader: 'file-loader'}
    ]
  }
}