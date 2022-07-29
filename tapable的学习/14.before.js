const { SyncHook } = require("../tapable");

const hook = new SyncHook(["name"]);
// 注册的顺序和执行的顺序不一致 可以有优先级的概念 那就用到了stage属性了
hook.tap({ name: "tap1" }, (name) => {
  console.log(name, "-----------", "tap1");
});

hook.tap({ name: "tap3" }, (name) => {
  console.log(name, "-----------", "tap3");
});

hook.tap({ name: "tap5", before: ["tap1", "tap3"] }, (name) => {
  console.log(name, "-----------", "tap5");
});

hook.tap({ name: "tap2", before: ["tap5"] }, (name) => {
  console.log(name, "-----------", "tap2");
});

hook.call("zs");
