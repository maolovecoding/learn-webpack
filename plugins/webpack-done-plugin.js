class WebpackDonePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // 同步调用
    console.log("webpack done plugin -----------");
    // 注册异步回调
    compiler.hooks.done.tapAsync("WebpackDonePlugin", (stats, callback) => {
      // stats 本次编译的结果 modules chunks entries assets filenames
      // console.log(stats);
      callback()
    });
  }
}

module.exports = WebpackDonePlugin;
