const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const TerserPlugin = require('terser-webpack-plugin');
const config = require('./webpack.config');
const { merge } = require('webpack-merge');

module.exports = merge(config, {
  mode: 'production',
  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     new TerserPlugin({
  //       extractComments: false, //  不提取注释，注释会在文件里
  //     })
  //   ]
  // },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          // 从public中复制文件
          from: path.resolve(__dirname, './public/'),
          // 把复制的文件存放到dis里面
          to: path.resolve(__dirname, './dist/')
        }
      ],
    })
  ],
  output: {
    publicPath: '/',    //自动生成html引入js的路径
  }
});