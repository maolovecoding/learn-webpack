const path = require("path");
const DonePlugin = require("./plugins/done-plugin");
const RunPlugin = require("./plugins/run-plugin");
module.exports = {
  entry: {
    index: "./src/index.js",
    main: "./src/main.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, "./loader/logger1-loader.js"),
          path.resolve(__dirname, "./loader/logger2-loader.js"),
        ],
      },
      {
        test: /\.css$/,
        use: [
          path.resolve(__dirname, "./loader/style-loader.js"),
        ],
      },
    ],
  },
  plugins: [new DonePlugin(), new RunPlugin()],
};
