const Hook = require("./Hook");
/**
 * 创建代码函数工厂
 */
class HookCodeFactory {
  /**
   *
   * @param {Hook} hookInstance
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  setup(hookInstance, options) {
    // 取出所有的事件处理函数 存放到 hook实例的 _x属性上
    hookInstance._x = options.taps.map((tapInfo) => tapInfo.fn);
  }
  /**
   *
   * @returns {string} 拼形参数组
   */
  #args() {
    const { args } = this.options;
    return args.join(",");
  }
  #header() {
    return `
    // header
    var _x = this._x;\n`;
  }
  callTapsSeries() {
    const taps = this.options.taps;
    let code = "";
    for (let i = 0; i < taps.length; i++) {
      const tapContent = this.#callTap(i);
      code += tapContent;
    }
    return code;
  }
  #callTap(tapIndex) {
    const tapInfo = this.options.taps[tapIndex];
    let code = `
    var _fn${tapIndex} = _x[${tapIndex}];
    `;
    switch (tapInfo.type) {
      case "sync":
        code += `_fn${tapIndex}(${this.#args()});\n`;
        break;
    }
    return code;
  }
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  #init(options) {
    this.options = options;
  }
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  create(options) {
    // 初始化创建
    this.#init(options);
    let fn;
    switch (this.options.type) {
      case "sync":
        // content方法 也就是具体的事件函数调用 会由子类实现
        fn = new Function(this.#args(), this.#header() + this.content());
        break;
      case "async":
        break;
      default:
        break;
    }
    // 销毁
    this.#deInit();
    return fn;
  }
  #deInit() {
    this.options = null;
  }
}

module.exports = HookCodeFactory;
