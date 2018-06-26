var webpack = require('webpack')

module.exports = {
  entry: './public/src/app.js',
  output: {
    filename: 'app.js',
    path: './public/bundles',
    publicPath: '/bundles/',
    chunkFilename: '[id].[hash].app.js'
  },
  module: {
    loaders: [{
      test: /\.vue$/,
      loader: 'vue-loader'
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }, {
      test: /\.css$/,
      loader: process.env.NODE_ENV === 'production' ? 'style-loader!css-loader?minimize' : 'style-loader!css-loader?-minimize'
    }, {
      test: /\.png$/,
      loader: 'url-loader',
      query: {
        mimetype: 'image/png'
      }
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval',
  plugins: process.env.NODE_ENV === 'production' ? [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin()
  ] : []
}
