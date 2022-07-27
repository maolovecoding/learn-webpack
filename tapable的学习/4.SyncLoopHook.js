const {
  // SyncHook,
  // SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  SyncLoopHook, // 循环钩子
  // AsyncParallelHook, // 并行异步钩子
  // AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  // AsyncSeriesBailHook, // 串行保险异步
  // AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  // AsyncSeriesLoopHook,// 串行循环钩子
} = require("tapable");

// SyncHook是一个类 创建一个同步钩子的实例
const hook = new SyncLoopHook();
let count1 = (count2 = count3 = 0);
let sum = 0;
// 注册钩子
hook.tap("1", () => {
  sum++;
  console.log("1-----------------count1", count1);
  if (++count1 === 1) {
    count1 = 0;
    // 返回undefined 继续执行下一个事件函数
    return;
  }
  // 不是undefined 重新开始执行第一个事件函数
  return true;
});
hook.tap("2", () => {
  sum++;
  console.log("2-----------------count2", count2);
  if (++count2 === 2) {
    count2 = 0;
    return;
  }
  return true;
});
hook.tap("3", () => {
  sum++;
  console.log("3-----------------count3", count3);
  if (++count3 === 3) {
    count3 = 0;
    return;
  }
  return true;
});
// 触发钩子
hook.call();
console.log("sum ->", sum);
