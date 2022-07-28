const SyncHook = require("./SyncHook");
const AsyncParallelHook = require("./AsyncParallelHook");
module.exports = {
  SyncHook,
  // SyncBailHook, // 同步有保险的钩子
  // SyncWaterfallHook, // 瀑布钩子
  // SyncLoopHook, // 循环钩子
  AsyncParallelHook, // 并行异步钩子
  // AsyncParallelBailHook, // 并行保险异步钩子
  // AsyncSeriesHook, // 串行异步钩子
  // AsyncSeriesBailHook, // 串行保险异步
  // AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  // AsyncSeriesLoopHook,// 串行循环钩子
};
