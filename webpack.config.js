const webpack = require('webpack');
const path = require('path');

const config = {
  entry: {
    app: './app/entry.js',
    vendor: ['react', 'react-dom']
  },

  output: {
    filename: 'bundle.js',
    path: './dist'
  },

  module: {
    loaders: [
      {test: /\.css$/, loader: "style!css"},
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ["es2015"]
        }
      }
    ]
  },

  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "app")
    ]
  },

  devtool: "source-map",
  target: "web",

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js'),
    new webpack.optimize.UglifyJsPlugin()
  ]
};

module.exports = config;
