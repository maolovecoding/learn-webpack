const { SyncHook } = require("tapable");
const Compilation = require("./Compilation");
class Compiler {
  constructor(options) {
    this.options = options;
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
    const onCompiled = () => {
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

module.exports = Compiler;
