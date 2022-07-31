const WebpackDonePlugin = require("./plugins/webpack-done-plugin");
const WebpackAssetsPlugin = require("./plugins/webpack-assets-plugin");
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
  plugins: [new WebpackDonePlugin(), new WebpackAssetsPlugin()],
};
