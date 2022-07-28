const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");
class AsyncParallelHookCodeFactory extends HookCodeFactory {
  content({ onDone } = { onDone: () => "_callback();" }) {
    // 并行
    return this.callTapsParallel({ onDone });
  }
}
const factory = new AsyncParallelHookCodeFactory();
/**
 * 异步并行钩子
 */
class AsyncParallelHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}

module.exports = AsyncParallelHook;
