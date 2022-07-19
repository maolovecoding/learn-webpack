const webpack = require("webpack");
const webpackOptions = require("../webpack.config.js");
const compiler = webpack(webpackOptions);
debugger
compiler.run((err, stats) => {
  console.log(err);
  console.log(
    stats.toJson({
      assets: true,
      chunks: true,
      modules: true,
    })
  );
});
