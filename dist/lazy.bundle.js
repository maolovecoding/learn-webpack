"use strict";
// self 在浏览器里面就是 window
(self["webpackChunklearn_webpack"] = self["webpackChunklearn_webpack"] || [])
  // 数组 二维结构 push方法就是jsonp回调的函数
  .push([
    ["lazy"],
    {
      // 懒加载的模块名
      "./src/lazy1.js": (module, exports, require) => {
        // 表名es module模块
        require.r(exports);
        // 定义默认导出
        require.d(exports, {
          default: () => _DEFAULT_EXPORT__,
          name: () => name,
        });
        const _DEFAULT_EXPORT__ = "hello";
        const name = "name";
      },
    },
  ]);
