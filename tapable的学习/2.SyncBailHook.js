const {
  // SyncHook,
  SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  // SyncLoopHook, // 循环钩子
  // AsyncParallelHook, // 并行异步钩子
  // AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  // AsyncSeriesBailHook, // 串行保险异步
  // AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  // AsyncSeriesLoopHook,// 串行循环钩子
} = require("tapable");

// SyncHook是一个类 创建一个同步钩子的实例
const hook = new SyncBailHook(["name", "age"]);
// 注册钩子
hook.tap("1", (name, age) => {
  console.log("-----------------", 1, name, age);
});
hook.tap("2", (name, age) => {
  console.log("-----------------", 2, name, age);
  // 有返回值 不在继续向下执行其他事件函数了
  return "2";
});
hook.tap("3", (name, age) => {
  console.log("-----------------", 3, name, age);
});
// 触发钩子
hook.call("zs", 22);
