const path = require("path");
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const smwp = new SpeedMeasureWebpackPlugin({});
const MiniCssWebpackPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// module.exports = smwp.wrap({
module.exports = {
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
  mode: "production",
  devtool: false,
  module: {
    rules: [
      { test: /\.css$/, use: [MiniCssWebpackPlugin.loader, "css-loader"] },
      {
        test: /\.png|jpg|gif/i,
        type: "asset/resource",
        generator: {
          // 图片资源的位置
          filename: "images/[hash][ext]",
        },
      },
    ],
  },
  // plugins: [new BundleAnalyzerPlugin()],
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new MiniCssWebpackPlugin({
      // filename: "[name].css",
      // 也可以指定目录
      filename: "css/[name].css",
    }),
  ],
};
// });
