const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: {
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  mode: "development",
  devtool: 'eval-source-map',
  module: {
    rules: [
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    })
  ],
};
