const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin')
module.exports = {
  entry: {
    main: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    // 全局热模块替换时调用的 self['webpackHotUpdate'] 函数名 固定
    hotUpdateGlobal: 'webpackHotUpdate'
  },
  mode: "development",
  devtool: 'source-map',
  module: {
    rules: [
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    // new HotModuleReplacementPlugin(), // 热更新插件 不写的时候 如果hot为true webpack会自动添加该插件
  ],
  devServer: {
    hot: true, // 支持热更新
    port: 8000,
    // contentBase: path.resolve(__dirname, 'static') 变成
    static: {
      directory: path.resolve(__dirname, 'public')
    }
  }
}
