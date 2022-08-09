const jszip = require("jszip");
const { RawSource } = require("webpack-sources");
const { Compilation } = require("webpack");
// 将打包产物压缩成压缩包
/**
 * 1. 如何获取打包后的文件名和文件内容
 * 2. 如何实现压缩包
 * 3. 如何向目标目录输出压缩包
 */
module.exports = class WebpackArchivePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // emit 钩子是webpack在确定好输出的文件名和文件内容之后 在写入谁的之前触发的，这是最后一个改变输出文件的机会
    // compilation 
    compiler.hooks.compilation.tap("webpackArchivePlugin", (compilation) => {
      // processAssets 处理资源的钩子 在 compiler.hooks.emit钩子执行之前执行了
      // 当确定好文件 当你处理每个资源的时候执行
      compilation.hooks.processAssets.tapPromise(
        {
          name: "webpackArchivePlugin",
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          // assets => 文件名：文件内容
          const zip = new jszip();
          for (const filename in assets) {
            // 资源对象
            const sourceObj = assets[filename];
            // 资源的源代码
            const sourceCode = sourceObj.source();
            // 放入资源
            zip.file(filename, sourceCode);
          }
          // 压缩
          return zip
            .generateAsync({ type: "nodebuffer" })
            .then((zipContent) => {
              // 放入资源
              assets[`archive_${Date.now()}.zip`] = new RawSource(zipContent);
            });
        }
      );
    });
  }
};
