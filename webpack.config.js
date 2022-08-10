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
  module: {
    rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
  },
  // 配置如何解析模块路径
  resolve: {
    // 尝试添加的文件拓展名
    extensions: [".js", ".jsx", "json"],
    // 别名
    alias: {
      // bootstrap模块指向我们配置的位置
      bootstrap: path.resolve(
        __dirname,
        "node_modules/bootstrap/dist/css/bootstrap.css"
      ),
    },
    // xxx可以是我们自己的模块目录 可以先去自己的模块目录中找模块
    modules: ["xxx", "node_modules"],
    // 找一个包中的package.json的主入口 配置其main字段 也就是找主入口对应的属性
    mainFields: ["module", "main", "base"],
    // 指定主入口文件名
    mainFiles: ["base", "main"],
  },
  resolveLoader:{
    // 上面的resolve属性在这里都有 但是只是在找loader的时候生效
  }
};
