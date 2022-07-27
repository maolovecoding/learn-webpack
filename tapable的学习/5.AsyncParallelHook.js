const {
  // SyncHook,
  // SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  // SyncLoopHook, // 循环钩子
  AsyncParallelHook, // 并行异步钩子
  // AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  // AsyncSeriesBailHook, // 串行保险异步
  // AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  // AsyncSeriesLoopHook,// 串行循环钩子
} = require("tapable");

const hook = new AsyncParallelHook(["name", "age"]);
// 同步注册
// hook.tap("1", (name, age) => {
//   console.log("1-----------------", name, age);
// });
// hook.tap("2", (name, age) => {
//   console.log("2-----------------", name, age);
// });
// hook.tap("3", (name, age) => {
//   console.log("3-----------------", name, age);
// });

// console.time("start");
// 异步注册 回调形式
// hook.tapAsync("1", (name, age, callback) => {
//   setTimeout(() => {
//     console.log("1-----------------", name, age);
//     // callback参数是一个函数 调用该函数表示回调执行结束了
//     callback();
//   }, 1000);
// });
// hook.tapAsync("2", (name, age, callback) => {
//   setTimeout(() => {
//     console.log("2-----------------", name, age);
//     callback();
//   }, 2000);
// });
// hook.tapAsync("3", (name, age, callback) => {
//   setTimeout(() => {
//     console.log("3-----------------", name, age);
//     callback();
//     console.timeEnd("start"); // start: 3.013s
//   }, 3000);
// });

// 触发钩子 callAsync
// hook.callAsync("zs", 22, (err) => {
//   // 有错误 会执行该回调函数
//   console.log("error->", err);
// });

console.time("promise");
// 异步注册 promise
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
