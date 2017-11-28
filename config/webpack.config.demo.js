var merge = require('webpack-merge')
var base = require('./webpack.config.base')
var path = require('path')

var outputFile = 'vue-responsive-calendar'
var globalName = 'VueResponsiveCalendar'

module.exports = merge(base, {
  entry: './src/demo/index.js',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: outputFile + '.demo.browser.js',
    publicPath: "/dist/",
  },
  devtool: 'eval-source-map',
});
