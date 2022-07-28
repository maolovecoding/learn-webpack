const {
  // SyncHook,
  // SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  // SyncLoopHook, // 循环钩子
  // AsyncParallelHook, // 并行异步钩子
  // AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  // AsyncSeriesBailHook, // 串行保险异步
  // AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  AsyncSeriesLoopHook, // 串行循环钩子
} = require("tapable");

const hook = new AsyncSeriesLoopHook(["name", "age"]);

let count1 = (count2 = count3 = 0);
let sum = 0;
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      sum++;
      console.log("1-----------------", name, age, count1);
      if (++count1 === 1) {
        count1 = 0;
        resolve();
      }
      resolve("1---");
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      sum++;
      console.log("2-----------------", name, age, count2);
      if (++count2 === 2) {
        count2 = 0;
        resolve();
      }
      resolve("2---");
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      sum++;
      console.log("3-----------------", name, age, count3);
      if (++count3 === 3) {
        count3 = 0;
        resolve();
      }
      resolve("3---");
    }, 3000);
  });
});
hook.promise("zs", 22).then((res) => {
  console.log("res->", res, "sum->", sum);
});
