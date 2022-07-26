const fs = require("fs");
/**
 * runner -> runLoaders -> iteratorPitchLoaders -> processResource -> iteratorNormalLoaders -> pitchCallback -> finalCallback
 * @param {*} options 配置选项
 * @param {*} finalCallback 最终回调
 */
function runLoaders(options, finalCallback) {
  const {
    resource, // 资源文件
    loaders = [], // 此文件需要用到的loader
    context = {}, // 上下文对象
    readResource = fs.readFile, // 读取文件的方法
  } = options;
  const loaderObjects = loaders.map(createLoaderObject);
  const loaderContext = context; // loader中normal或者pitch函数执行时候的this对象
  loaderContext.resource = resource;
  loaderContext.loaders = loaderObjects;
  loaderContext.readResource = readResource;
  loaderContext.loaderIndex = 0; // 当前正在执行的loader的索引
  loaderContext.callback = null; // 回调阿汉 它的作用是调用以后就会执行下一步的loader
  loaderContext.async = null; // 默认loader的执行是同步的 执行loader的代码以后 执行下一个loader的代码 调用该函数 同步变为异步了
  // 定义一些getter
  defineLoaderContextGetters(loaderContext);
  const processOptions = {
    resourceBuffer: null, // 要处理的资源文件的Buffer index.js对应的buffer
    readResource,
  };
  // 开始迭代执行每个loader的pitch函数
  iteratePitchLoader(processOptions, loaderContext, (err, result) => {
    finalCallback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}
/**
 * 迭代执行pitch函数
 * @param {*} processOptions
 * @param {*} loaderContext
 * @param {*} pitchCallback
 */
function iteratePitchLoader(processOptions, loaderContext, pitchCallback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    // loader处理完毕 加载资源
    return processResource(processOptions, loaderContext, pitchCallback);
  }
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  // pitch已经执行过了
  if (currentLoader.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchLoader(processOptions, loaderContext, pitchCallback);
  }
  const pitch = currentLoader.pitch;
  currentLoader.pitchExecuted = true; // pitch已经执行过了
  // 当前loader没有pitch 进入下一个loader
  if (!typeof pitch === "function") {
    return iteratePitchLoader(processOptions, loaderContext, pitchCallback);
  }
  // 以同步或者异步的方式 执行pitch
  runSyncOrAsync(
    pitch,
    loaderContext,
    [
      loaderContext.remainingRequest,
      loaderContext.previousRequest,
      loaderContext.data,
    ],
    (err, ...args) => {
      // 执行下一个loader
      // 如果pitch的返回值不为空 则跳过后续的loader和读文件操作 直接掉头执行前一个loader的normal
      if (args.length > 0 && args.some((item) => !!item)) {
        loaderContext.loaderIndex--;
        return iterateNormalLoader(
          processOptions,
          loaderContext,
          args,
          pitchCallback
        );
      } else {
        return iteratePitchLoader(processOptions, loaderContext, pitchCallback);
      }
    }
  );
}
/**
 * 读取资源文件并处理 然后开始执行loader的normal函数了
 * @param {*} processOptions
 * @param {*} loaderContext
 * @param {*} pitchCallback
 */
function processResource(processOptions, loaderContext, pitchCallback) {
  processOptions.readResource(loaderContext.resource, (err, resourceBuffer) => {
    processOptions.resourceBuffer = resourceBuffer;
    loaderContext.loaderIndex--;
    iterateNormalLoader(
      processOptions,
      loaderContext,
      [resourceBuffer],
      pitchCallback
    );
  });
}
/**
 *
 * @param {*} processOptions
 * @param {*} loaderContext
 * @param {Array} args 可能是pitch的返回值 也可能是loader的normal返回值 或者是最顶级的webpack加载的资源传递给loader
 * @param {*} pitchingCallback
 */
function iterateNormalLoader(
  processOptions,
  loaderContext,
  args,
  pitchingCallback
) {
  // loader执行完毕
  if (loaderContext.loaderIndex < 0) {
    return pitchingCallback(null, ...args);
  }
  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoader(
      processOptions,
      loaderContext,
      args,
      pitchingCallback
    );
  }
  const normalFn = currentLoader.normal;
  currentLoader.normalExecuted = true;
  convertArgs(args, currentLoader.raw);
  runSyncOrAsync(normalFn, loaderContext, args, (err, ...res) => {
    return iterateNormalLoader(
      processOptions,
      loaderContext,
      [res],
      pitchingCallback
    );
  });
}
/**
 * 根据参数转换buffer和string
 * @param {Array} args
 * @param {boolean} raw true 表示需要buffer
 */
function convertArgs(args, raw) {
  const isBuffer = Buffer.isBuffer(args[0]);
  if (raw && !isBuffer) {
    args[0] = Buffer.from(args[0]);
  } else if (!raw && isBuffer) {
    args[0] = args[0].toString();
  }
}
/**
 *
 * @param {Function} fn pitch 需要处理pitch的同步异步
 * @param {*} loaderContext
 * @param {*} args
 * @param {Function} runCallback
 */
function runSyncOrAsync(fn, loaderContext, args, runCallback) {
  // 默认同步执行
  let isSync = true;
  // 在loader的函数里执行该函数 相当于执行下一个loader对应的函数
  loaderContext.callback = (...args) => {
    runCallback(...args);
  };
  loaderContext.async = function () {
    // 把同步执行的标识标记为异步
    isSync = false;
    return loaderContext.callback;
  };
  // pitch返回结果 如果是loader的normal函数调用了async方法，就会变成异步了 当然pitch方法也可以异步的
  const result = fn.apply(loaderContext, args);
  // 如果是同步loader pitch
  if (isSync) {
    // 直接调用runCallback向下执行 如果是异步 不执行任何代码 等待在loader里调用callback
    runCallback(null, result);
  }
}
/**
 * 把loader的觉得对路径变成一个函数
 * @param {*} loader
 * @returns
 */
function createLoaderObject(loader) {
  // 获取loader的normal函数（导出的函数）
  const normal = require(loader);
  // 获取pitch方法
  const pitch = normal.pitch;
  // 获取 raw 如果为true 我们传递给loader的源内容是一个Buffer，否则就是一个字符串
  const raw = normal.raw;
  return {
    path: loader,
    normal,
    pitch,
    raw, // 为true的时候 内容是buffer 也就是二进制了
    data: {}, // 每个loader可以携带一个自定义的数据对象
    pitchExecuted: false, // pitch方法是否执行过
    normalExecuted: false, // normal（loader函数本身）是否执行过
  };
}

function defineLoaderContextGetters(loaderContext) {
  // 代表本次请求
  Object.defineProperty(loaderContext, "request", {
    get() {
      // loader1!loader2!index.js
      return loaderContext.loaders
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
    set() {},
  });
  // 剩下的请求
  Object.defineProperty(loaderContext, "remainingRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  // 当前的loader和剩余的loader请求
  Object.defineProperty(loaderContext, "currentRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  // 之前的请求（处理过的）
  Object.defineProperty(loaderContext, "previousRequest", {
    get() {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  // data 当前loader的data
  Object.defineProperty(loaderContext, "data", {
    get() {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });
}

module.exports = runLoaders;
