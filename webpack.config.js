const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: {
    index: './src/home/index.tsx',
    options: './src/options/index.tsx'
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
      ],
      exclude: /node_modules/
    },
    {
      test: /\.(les|cs)s$/i,
      use: [{
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: "[name]__[local]--[hash:base64:5]",
          }
        }
      },
      {
        loader: 'less-loader',
        options: {
          lessOptions: {
            javascriptEnabled: true
          }
        }
      },
      ],
      // exclude: /node_modules/
    },
    ],
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
},
  resolve: {
    extensions: ['.tsx', '.ts', '.css', '.less', '.js'],
    alias: {
      '@': path.resolve('src'),
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve('./index.html'),
      filename: 'index.html',
      chunks: ['index'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve('./index.html'),
      filename: 'options.html',
      chunks: ['options'],
      inject: 'body'
    }),
    new WebpackBar()
  ],
  output: {
    // filename: 'bundle_[chunkhash:8].js',
    filename: '[name]_[chunkhash:8].js',
    path: path.resolve(__dirname, 'dist'),
    asyncChunks: true,
    clean: true,
    publicPath: '/',
    //按需加载
    chunkFilename: '[name]_[chunkhash:8].js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};