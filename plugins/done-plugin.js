module.exports = class DonePlugin {
  apply(compiler) {
    compiler.hooks.done.tap("webpackDonePlugin", () => {
      console.log("结束编译 ~");
    });
  }
};
