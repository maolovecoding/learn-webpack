const WebpackDonePlugin = require("./plugins/webpack-done-plugin");
const WebpackAssetsPlugin = require("./plugins/webpack-assets-plugin");
const WebpackArchivePlugin = require("./plugins/webpack-archive-plugin");
const WebpackExternalPlugin = require("./plugins/webpack-external-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  mode: "development",
  devtool: false,
  // 配置模块外链 原理是不再打包对应的lodash模块了（值就是模块导出的变量）
  // 最终打包时 这些模块导出的内容是从 window.xxx 也就是说从window上取出来的
  // externals: {
  //   lodash: "_",
  // },
  plugins: [
    // new WebpackDonePlugin(),
    // new WebpackAssetsPlugin(),
    // new WebpackArchivePlugin(),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new WebpackExternalPlugin({
      lodash: {
        varName: "_",
        url: "https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.js",
      },
    }),
  ],
};
