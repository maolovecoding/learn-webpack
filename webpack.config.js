const path = require("path");
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const smwp = new SpeedMeasureWebpackPlugin({});
const MiniCssWebpackPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = smwp.wrap({
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    // 打包库 库名称
    // library: "calc",
    // libraryTarget: "var",
  },
  mode: "development",
  devtool: false,
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssWebpackPlugin.loader, "css-loader"] },
    ],
  },
  // plugins: [new BundleAnalyzerPlugin()],
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new MiniCssWebpackPlugin(),
  ],
});
