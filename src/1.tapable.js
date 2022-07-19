// const { SyncHook } = require("tapable");
// 创建同步的hook
// 参数 ["参数名称"] 是声明的回调函数的形参 传递给钩子 就是占位 看有几个参数而已
// const syncHook = new SyncHook(["name"]);
class SyncHook {
  constructor(args = []) {
    this.argsLength = args.length;
    this.taps = [];
  }
  tap(name, cb) {
    this.taps.push({ name, cb });
  }
  call(...args) {
    this.taps.forEach((tap) => tap.cb(...args.slice(0, this.argsLength)));
  }
}
// 插件 就是一个类 有apply函数
class SomePlugin {
  apply() {
    syncHook.tap("SomePlugin", (name) => {
      console.log("SomePlugin", name);
    });
  }
}

const syncHook = new SyncHook(["name"]);
// syncHook.tap("监听器名称", 回调函数)
syncHook.tap("f1", (name) => {
  console.log("f1 ", name);
});
syncHook.tap("f2", (name) => {
  console.log("f2 ", name);
});

new SomePlugin().apply();
// 触发钩子的执行
syncHook.call("name ");
