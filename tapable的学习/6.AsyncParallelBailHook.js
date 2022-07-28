const {
  // SyncHook,
  // SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  // SyncLoopHook, // 循环钩子
  // AsyncParallelHook, // 并行异步钩子
  AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  // AsyncSeriesBailHook, // 串行保险异步
  // AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  // AsyncSeriesLoopHook,// 串行循环钩子
} = require("tapable");

const hook = new AsyncParallelBailHook(["name", "age"]);

console.time("promise");
// 异步注册 promise
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      // 只要有一个resolve有了返回值，触发函数的返回的promise就直接成功了
      resolve("1---");
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      resolve();
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise"); // promise: 3.006s
    }, 3000);
  });
});

// 触发钩子 callAsync
hook.promise("zs", 22).then((res) => {
  // 有错误 会执行该回调函数
  console.log("res->", res);
});
