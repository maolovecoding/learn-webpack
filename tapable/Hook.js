class Hook {
  /**
   *
   * @param {Array} args
   */
  constructor(args = []) {
    /**
     * 事件函数形参列表
     * @type {Array<string>}
     */
    this.args = args;
    /**
     * 存放事件函数
     * @type {Array<{name:string,fn:Function,type:"sync"|"async"}>}
     */
    this.taps = [];
    //  假的call方法 占位
    this.call = CALL_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    this.promise = PROMISE_DELEGATE;
    // 将会存放要执行的事件处理函数
    this._x = null;
    // 拦截器数组
    /**
     * @type {Array<{tap:Function,call:Function,register:Function}>}
     */
    this.interceptors = [];
  }
  /**
   *
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  tap(options, fn) {
    this.#_tap("sync", options, fn);
  }
  tapAsync(options, fn) {
    this.#_tap("async", options, fn);
  }
  tapPromise(options, fn) {
    this.#_tap("promise", options, fn);
  }
  /**
   * 注册拦截器
   * @param {{tap:Function,call:Function,register:Function}} interceptor
   */
  intercept(interceptor) {
    this.interceptors.push(interceptor);
  }
  /**
   * @param {"sync"|"async"} type 调用类型
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  #_tap(type, options, fn) {
    if (typeof options === "string") {
      options = { name: options, stage: Number.MAX_SAFE_INTEGER };
    }
    // 两个属性 name fn type stage属性 默认值 MAX_INTEGER
    let tapInfo = { stage: Number.MAX_SAFE_INTEGER, ...options, fn, type };
    // 执行注册拦截器 register
    tapInfo = this.#runRegisterInterceptors(tapInfo);
    this.#insert(tapInfo);
  }
  /**
   * 执行register拦截器 可以改变tapInfo的
   * @param {{name:string,fn:Function,type:"sync"|"async"|"promise"}}} tapInfo
   */
  #runRegisterInterceptors(tapInfo) {
    for (const interceptor of this.interceptors) {
      if (typeof interceptor.register === "function") {
        const newTapInfo = interceptor.register(tapInfo);
        if (typeof newTapInfo !== "undefined") {
          tapInfo = newTapInfo;
        }
      }
    }
    return tapInfo;
  }
  /**
   * 注册一个事件函数
   * @param {{name:string,fn:Function,type:"sync"|"async",stage:number,before:string[]|string}} tapInfo
   */
  #insert(tapInfo) {
    // TODO 可以做before
    // TODO 有stage进行插入排序 默认全都有了
    let i = this.taps.length;
    if (!i) {
      this.taps.push(tapInfo);
      return;
    }
    while (i--) {
      if (this.taps[i].stage <= tapInfo.stage) {
        this.taps[i + 1] = tapInfo;
        break;
      } else {
        this.taps[i + 1] = this.taps[i];
      }
    }
  }
  /**
   * 触发事件函数的执行 事件函数的动态编译的
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param  {...any} args
   */
  // #call(options, ...args) {}
  /**
   *
   * @param {"sync"|"async"} type
   */
  _createCall(type) {
    // 执行编译 生成 call方法 交给子类实现的
    return this.compile({
      taps: this.taps,
      args: this.args,
      type,
      interceptors: this.interceptors,
    });
  }
}

// 同步代理
const CALL_DELEGATE = function (...args) {
  // 生成 call方法
  this.call = this._createCall("sync");
  // 执行
  return this.call(...args);
};
// 异步代理
const CALL_ASYNC_DELEGATE = function (...args) {
  // 生成 call方法
  this.callAsync = this._createCall("async");
  // 执行
  return this.callAsync(...args);
};
// promise
const PROMISE_DELEGATE = function (...args) {
  // 生成 call方法
  this.promise = this._createCall("promise");
  // 执行
  return this.promise(...args);
};

module.exports = Hook;
