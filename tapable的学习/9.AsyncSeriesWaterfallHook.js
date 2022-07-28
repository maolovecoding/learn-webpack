const {
  // SyncHook,
  // SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  // SyncLoopHook, // 循环钩子
  // AsyncParallelHook, // 并行异步钩子
  // AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  // AsyncSeriesBailHook, // 串行保险异步
  AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  // AsyncSeriesLoopHook,// 串行循环钩子
} = require("tapable");

const hook = new AsyncSeriesWaterfallHook(["name", "age"]);

console.time("promise");
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      // 返回值作为下一个执行的事件函数的第一个参数 效果和前面的同步钩子差不多
      resolve("1---");
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      // 有返回值 那么就会覆盖掉上一个执行的事件函数的返回值 没有的时候 当前事件函数的下一个要执行的事件函数的参数还是上一次的事件函数返回值
      // resolve("2---");
      resolve();
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise");
    }, 3000);
  });
});

// 触发钩子 callAsync
hook.promise("zs", 22).then((res) => {
  // 有错误 会执行该回调函数
  console.log("res->", res);
});
