const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class SyncHookCodeFactory extends HookCodeFactory {
  content() {
    // 调用父类的串行方法 执行taps
    return this.callTapsSeries();
  }
}
const factory = new SyncHookCodeFactory();
class SyncHook extends Hook {
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}
module.exports = SyncHook;
