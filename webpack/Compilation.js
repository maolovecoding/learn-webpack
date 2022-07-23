const fs = require("fs");
const path = require("path");
/**
 * 统一路径分割符
 * @param {*} path
 * @returns
 */
function toUnixPath(path) {
  return path.replace(/\\/g, "/");
}
const baseDir = toUnixPath(process.cwd());
class Compilation {
  constructor(options) {
    this.options = options;
    // 本次编译所有生成出来的模块
    this.modules = [];
    // 本次编译产出的代码块 入口模块和依赖的模块打包在一起的代码块
    this.chunks = [];
    // 本次编译产出的资源文件
    this.assets = {};
    // 本次打包涉及了那些文件 主要是为了实现监听watch文件变化 文件变化重新编译
    this.fileDependencies = [];
  }
  /**
   * 编译
   * @param {*} callback 成功的回调
   */
  build(callback) {
    // 5. 根据配置文件中有entry配置项找到所有的入口
    let entry = {};
    if (typeof this.options.entry === "string") {
      // 语法糖形式
      entry.main = this.options.entry;
    } else {
      // 对象形式
      entry = this.options.entry;
    }
    // 6. 从入口文件触发，调用所有配置的规则，比如loader对模块进行编译
    for (const entryName in entry) {
      // 入口的名称就是entry的属性名 也将会成为代码块的名字
      // 统一使用unix下的分隔符连接 / 路径
      const entryFilePath = path.posix.join(baseDir, entry[entryName]);
      // 把入口文件的绝对路径添加到依赖数组
      this.fileDependencies.push(entryFilePath);
      // 编译模块
      const entryModule = this.buildModule(entryName, entryFilePath);
    }
  }
  /**
   * 编译模块
   */
  buildModule(moduleName, modulePath) {
    // 6.1 读取模块内容
    let moduleSourceCode = fs.readFileSync(modulePath, "utf-8");
    // 查找对应规则的loader 进行编译 和转换
    const loaders = [];
    const { rules = [] } = this.options.module;
    rules.forEach((rule) => {
      const { test } = rule;
      // 模块的正则匹配 将此loader添加到稍后要使用的loader数组中
      if (modulePath.match(test)) {
        // TODO 现在默认use一定是一个数组
        loaders.push(...rule.use);
      }
      // 自右向左对模块进行编译
      moduleSourceCode = loaders.reduceRight((sourceCode, loader) => {
        return require(loader)(sourceCode);
      }, moduleSourceCode);
      return moduleSourceCode;
    });
  }
}
module.exports = Compilation;
