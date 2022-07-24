const { SyncHook } = require("tapable");
const Compilation = require("./Compilation");
const path = require("path");
const fs = require("fs");
class Compiler {
  constructor(options) {
    this.options = initOptions(options);
    // 钩子
    this.hooks = {
      run: new SyncHook(), // 编译开始时的钩子
      done: new SyncHook(), // 编译结束时的钩子
    };
  }
  /**
   *  4. 执行`Compiler`对象的`run`方法开始执行编译
   */
  run(callback) {
    // 启动编译前 执行run的钩子
    this.hooks.run.call();
    // 编译成功的回调
    const onCompiled = (err, stats, fileDependencies) => {
      // 10. 确定好输出内容之后，会根据配置的输出路径和文件名，把文件内容写入到文件系统里
      for (const filename in stats.assets) {
        const filePath = path.join(this.options.output.path, filename);
        if (!fs.existsSync(this.options.output.path))
          fs.mkdirSync(this.options.output.path);
        fs.writeFileSync(filePath, stats.assets[filename], "utf-8");
      }
      // 回调钩子
      callback(err, {
        toJson: (res) => {
          for (const key in res) {
            if (res[key]) {
              res[key] = stats[key];
            }
          }
          return res;
        },
      });
      // 根据文件依赖 监听文件变化 文件变化自动重新编译
      fileDependencies.forEach((fileDependency) => {
        fs.watch(fileDependency, () => this.compile(onCompiled));
      });
      // 编译成功 执行done钩子
      this.hooks.done.call();
    };
    // 开始编译了 成功后调用onCompiled
    this.compile(onCompiled);
  }
  /**
   * 开始编译
   * @param {*} callback 编译成功的回调
   */
  compile(callback) {
    // webpack 只有一个compiler对象 但是每次编译都会产出一个新的Compilation对象
    const compilation = new Compilation(this.options);
    // 执行build方法进行编译 成功后执行回调
    compilation.build(callback);
  }
}
function initOptions(options) {
  // 默认的选项
  if (!options.resolve) options.resolve = {};
  const resolve = options.resolve;
  if (!resolve.extensions) {
    resolve.extensions = [".js", ".json", ".node"];
  }
  if (!options.output) {
    options.output = {
      filename: "[name].js",
      path: path.resolve(process.cwd(), "dist"),
    };
  }
  return options;
}

module.exports = Compiler;
