const path = require("path");
const DonePlugin = require("./plugins/done-plugin");
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  plugins:[
    new DonePlugin()
  ]
};
