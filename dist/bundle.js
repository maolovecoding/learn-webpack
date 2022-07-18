// 模块
var modules = {};
// 缓存
var cache = {};
debugger
// 浏览器的require方法
function require(moduleId) {
  var cachedModule = cache[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  var module = (cache[moduleId] = {
    exports: {},
  });
  modules[moduleId](module, module.exports, require);
  return module.exports;
}
// 通过 m属性可以访问存放模块的对象
require.m = modules;
// 定义属性
require.d = (exports, definition) => {
  for (var key in definition) {
    if (require.o(definition, key) && !require.o(exports, key)) {
      Object.defineProperty(exports, key, {
        enumerable: true,
        get: definition[key],
      });
    }
  }
};
// 存放所有异步加载的模块
require.f = {};
// e 方法可以异步加载模块 是一个promise
// promise成功后会把该模块放到 modules上（require.m）
// 调用require方法加载 lazy1模块，获取导出对象
require.e = (chunkId) => {
  // 实际异步加载是把所有f中的异步模块一起加载 但是获取可以单独拿到需要的模块
  return Promise.all(
    Object.keys(require.f).reduce((promises, key) => {
      require.f[key](chunkId, promises);
      return promises;
    }, [])
  );
};
// unique name 资源的唯一名称
require.u = (chunkId) => {
  return "" + chunkId + ".bundle.js";
};
require.g = (function () {
  if (typeof globalThis === "object") return globalThis;
  try {
    return this || new Function("return this")();
  } catch (e) {
    if (typeof window === "object") return window;
  }
})();
// 属性是自身的
require.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
var inProgress = {};
var dataWebpackPrefix = "learn-webpack:";
/**
 * 加载资源
 * @param {*} url 
 * @param {*} done 
 * @param {*} key 
 * @param {*} chunkId 
 * @returns 
 */
require.l = (url, done, key, chunkId) => {
  if (inProgress[url]) {
    inProgress[url].push(done);
    return;
  }
  var script, needAttach;
  if (key !== undefined) {
    // 创建脚本
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (
        s.getAttribute("src") == url ||
        s.getAttribute("data-webpack") == dataWebpackPrefix + key
      ) {
        script = s;
        break;
      }
    }
  }
  if (!script) {
    needAttach = true;
    script = document.createElement("script");
    script.charset = "utf-8";
    script.timeout = 120;
    if (require.nc) {
      script.setAttribute("nonce", require.nc);
    }
    script.setAttribute("data-webpack", dataWebpackPrefix + key);
    script.src = url;
  }
  inProgress[url] = [done];
  var onScriptComplete = (prev, event) => {
    script.onerror = script.onload = null;
    clearTimeout(timeout);
    var doneFns = inProgress[url];
    delete inProgress[url];
    script.parentNode && script.parentNode.removeChild(script);
    doneFns && doneFns.forEach((fn) => fn(event));
    if (prev) return prev(event);
  };
  var timeout = setTimeout(
    onScriptComplete.bind(null, undefined, {
      type: "timeout",
      target: script,
    }),
    // 超时时长 120s
    120000
  );
  script.onerror = onScriptComplete.bind(null, script.onerror);
  script.onload = onScriptComplete.bind(null, script.onload);
  // 将脚本添加到html中
  needAttach && document.head.appendChild(script);
};
require.r = (exports) => {
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  }
  Object.defineProperty(exports, "__esModule", { value: true });
};
var scriptUrl;
if (require.g.importScripts) scriptUrl = require.g.location + "";
var document = require.g.document;
if (!scriptUrl && document) {
  if (document.currentScript) scriptUrl = document.currentScript.src;
  if (!scriptUrl) {
    var scripts = document.getElementsByTagName("script");
    if (scripts.length) scriptUrl = scripts[scripts.length - 1].src;
  }
}
if (!scriptUrl)
  throw new Error("Automatic publicPath is not supported in this browser");
scriptUrl = scriptUrl
  .replace(/#.*$/, "")
  .replace(/\?.*$/, "")
  .replace(/\/[^\/]+$/, "/");
// 资源的访问路径 public path 就是我们配置文件中的publicPath属性
require.p = scriptUrl;
// 存放加载代码块的状态
// key是代码块的名字
// value 是一个模块的加载状态 0表示准备就绪
var installedChunks = {
  // 就是index主模块
  main: 0,
};
/**
 * 加载远程模块（异步加载）的方法 其实就是JSONP
 * @param {*} chunkId 模块名
 * @param {*} promises promise数组
 */
require.f.j = (chunkId, promises) => {
  // 当前的代码块的数据
  var installedChunkData = require.o(installedChunks, chunkId)
    ? installedChunks[chunkId]
    : undefined;
  if (installedChunkData !== 0) {
    if (installedChunkData) {
      promises.push(installedChunkData[2]);
    } else {
      if (true) {
        // 创建promise
        var promise = new Promise(
          (resolve, reject) =>
            // installedChunks添加当前模块记录 id : [resolve, reject]
            (installedChunkData = installedChunks[chunkId] = [resolve, reject])
        );
        // 将promise放到异步的数组中
        // 且 将promise本身也放到当前代码块对象里面 [resolve, reject, promise]
        promises.push((installedChunkData[2] = promise));
        // 请求地址 资源访问路径 + 资源的唯一标识
        var url = require.p + require.u(chunkId);
        // 创建错误
        var error = new Error();
        var loadingEnded = (event) => {
          if (require.o(installedChunks, chunkId)) {
            installedChunkData = installedChunks[chunkId];
            if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
            if (installedChunkData) {
              var errorType =
                event && (event.type === "load" ? "missing" : event.type);
              var realSrc = event && event.target && event.target.src;
              error.message =
                "Loading chunk " +
                chunkId +
                " failed.\n(" +
                errorType +
                ": " +
                realSrc +
                ")";
              error.name = "ChunkLoadError";
              error.type = errorType;
              error.request = realSrc;
              installedChunkData[1](error);
            }
          }
        };
        require.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
      } else installedChunks[chunkId] = 0;
    }
  }
};
/**
 * jsonp方法的回调函数 
 * @param {*} parentChunkLoadingFunction 
 * @param {*} data
 */
var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
  // chunkIds 代码块ID数组
  // data 额外的模块定义
  var [chunkIds, moreModules, runtime] = data;
  var moduleId,
    chunkId,
    i = 0;
    // 不为0表示模块还没加载完毕
  if (chunkIds.some((id) => installedChunks[id] !== 0)) {
    for (moduleId in moreModules) {
      if (require.o(moreModules, moduleId)) {
        // m -> modules 将模块合并到modules上
        require.m[moduleId] = moreModules[moduleId];
      }
    }
    if (runtime) var result = runtime(require);
  }
  if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
  for (; i < chunkIds.length; i++) {
    // 拿到每个模块的id标识
    chunkId = chunkIds[i];
    if (require.o(installedChunks, chunkId) && installedChunks[chunkId]) {
      // resolve方法执行
      installedChunks[chunkId][0]();
    }
    // 表示模块加载完毕了 可以使用
    installedChunks[chunkId] = 0;
  }
};
// 全局正在懒加载的模块
var chunkLoadingGlobal = (self["webpackChunklearn_webpack"] =
  self["webpackChunklearn_webpack"] || []);

chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
chunkLoadingGlobal.push = webpackJsonpCallback.bind(
  null,
  // 回调的第一个参数 就是父模块的回调函数
  chunkLoadingGlobal.push.bind(chunkLoadingGlobal)
);
var exports = {};
require
  .e("lazy")
  .then(require.bind(require, "./src/lazy1.js"))
  .then((module) => {
    console.log(module);
  });
