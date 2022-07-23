module.exports = class RunPlugin {
  apply(compiler) {
    compiler.hooks.run.tap("webpackRunPlugin", () => {
      console.log("开始编译 ~");
    });
  }
};
