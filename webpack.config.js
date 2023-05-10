const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')
// const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin')
// const PreloadWebpackPlugin = require('./plugin/preload-webpack-plugin')
module.exports = {
  entry: {
    main: "./src/index.js",
    // entry2: './src/entry2.js'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    // 全局热模块替换时调用的 self['webpackHotUpdate'] 函数名 固定
    // hotUpdateGlobal: 'webpackHotUpdate',
    clean: true
  },
  mode: "development",
  devtool: 'source-map',
  // resolveLoader: {
  //   alias: {
  //     'babel-loader': path.resolve(__dirname, './loader/babel-loader.js'),
  //   }
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // loader: path.resolve(__dirname, './loader/babel-loader.js'),
          options: {
            presets: ['@babel/preset-env'],
            // plugins: [
              // lodash库按需加载
              // ['babel-plugin-import', { libraryName: 'lodash', libraryDirectory: '' }]
              // [path.resolve(__dirname, './plugin/babel-import-plugin'), { libraryName: 'lodash', libraryDirectory: '' }]
            // ]
          }
        }
      },
      {
        test: /\.batest$/,
        use: [
          path.resolve(__dirname, './loader/loader1.js')
        ]
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    // new HotModuleReplacementPlugin(), // 热更新插件 不写的时候 如果hot为true webpack会自动添加该插件
    // new PreloadWebpackPlugin(),
  ],
  devServer: {
    hot: true, // 支持热更新
    port: 8000,
    // contentBase: path.resolve(__dirname, 'static') 变成
    static: {
      directory: path.resolve(__dirname, 'public')
    }
  },
  resolve: {
    extensions: ['.js', 'json', '.ts', '.tsx', '.jsx']
  }
}
