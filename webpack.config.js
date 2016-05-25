var webpack = require('webpack');  
module.exports = {  
  entry: './src/component.ts',
  // output: {
  //   filename: './dist/bundle.js'
  // },
  // Turn on sourcemaps
  // devtool: 'source-map',
  // resolve: {
  //   extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  // },
  // Add minification
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  }
}