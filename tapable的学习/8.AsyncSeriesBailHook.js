const {
  // SyncHook,
  // SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  // SyncLoopHook, // 循环钩子
  // AsyncParallelHook, // 并行异步钩子
  // AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  AsyncSeriesBailHook, // 串行保险异步
  // AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  // AsyncSeriesLoopHook,// 串行循环钩子
} = require("tapable");

const hook = new AsyncSeriesBailHook(["name", "age"]);

console.time("promise");
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      resolve();
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      resolve("2---");
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise"); // 上一个事件函数有返回值了 不会执行到这里
    }, 3000);
  });
});

// 触发钩子 callAsync
hook.promise("zs", 22).then((res) => {
  // 有错误 会执行该回调函数
  console.log("res->", res);
});
