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
   * @param {"sync"|"async"} type 调用类型
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  #_tap(type, options, fn) {
    if (typeof options === "string") {
      options = { name: options };
    }
    // 两个属性 name fn
    const tapInfo = { ...options, fn, type };
    this.#insert(tapInfo);
  }
  /**
   * 注册一个事件函数
   * @param {{name:string,fn:Function,type:"sync"|"async"}} tapInfo
   */
  #insert(tapInfo) {
    this.taps.push(tapInfo);
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
