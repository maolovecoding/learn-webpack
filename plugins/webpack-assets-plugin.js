/**
 * 打印本次产出的代码块和文件
 */
class WebpackAssetsPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // 每当webpack开启一次新的编译 就会创建一个新的compilation
    compiler.hooks.compilation.tap("WebpackAssetsPlugin", (compilation) => {
      // 每当根据chunk创建一个新的文件后 会触发一次chunkAsset钩子
      compilation.hooks.chunkAsset.tap(
        "WebpackAssetsPlugin",
        (chunk, filename) => {
          // 代码块的 name 或者 id filename是打包的名字
          console.log(chunk.name || chunk.id, filename);
        }
      );
    });
  }
}

module.exports = WebpackAssetsPlugin;
