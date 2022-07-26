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
  devtool: "source-map",
  resolveLoader: {
    alias: {
      "babel-loader": path.resolve(__dirname, "./loader/babel-loader.js"),
      "less-loader": path.resolve(__dirname, "./loader/less-loader.js"),
      "style-loader": path.resolve(__dirname, "./loader/style-loader.js"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude:/node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          { loader: "style-loader" },
          // { loader: "css-loader" },
          { loader: "less-loader" },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
