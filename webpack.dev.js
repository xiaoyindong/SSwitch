const config = require('./webpack.config');
const { merge } = require('webpack-merge');

module.exports = merge(config, {
  mode: 'development',
  devServer: {
    client: {
      overlay: true,
    },
    hot: true,
    host: '127.0.0.1',
    port: 8000,
    open: true,
    static: {
      publicPath: '/',
    },
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'https://zhiqianduan.com',
        changeOrigin: true,
        secure: false
      },
      '/voice': {
        target: 'https://zhiqianduan.com',
        changeOrigin: true,
        secure: false
      },
      '/github': {
        target: 'https://zhiqianduan.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});