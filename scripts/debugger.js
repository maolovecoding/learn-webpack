const webpack = require("../webpack");
const webpackOptions = require("../webpack.config.js");
const compiler = webpack(webpackOptions);
debugger
compiler.run((err, stats) => {
  console.log(err);
  console.log(
    stats.toJson({
      // 本次编译产出的资源
      assets: true,
      // 本次编译产出的代码块
      chunks: true,
      // 本次编译产出的模块
      modules: true,
    })
  );
});
