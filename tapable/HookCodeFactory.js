const Hook = require("./Hook");
/**
 * 创建代码函数工厂
 */
class HookCodeFactory {
  /**
   *
   * @param {Hook} hookInstance
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[],interceptors:any[]}} options
   */
  setup(hookInstance, options) {
    // 取出所有的事件处理函数 存放到 hook实例的 _x属性上
    hookInstance._x = options.taps.map((tapInfo) => tapInfo.fn);
  }
  /**
   *
   * @returns {string} 拼形参数组
   */
  #args({ after } = {}) {
    const { args } = this.options;
    const allArgs = args.slice(0);
    if (after) {
      allArgs.push(after);
    }
    return allArgs.join(", ");
  }
  #header() {
    const interceptors = this.options.interceptors;
    let code = `
    // header
    var _x = this._x;\n`;
    // 拦截器 call拦截器的实现
    if (interceptors.length > 0) {
      code += `var _taps = this.taps;
      var _interceptors = this.interceptors;
      `;
      for (let k = 0; k < interceptors.length; k++) {
        const interceptor = interceptors[k];
        if (typeof interceptor.call === "function") {
          code += `_interceptors[${k}].call(${this.#args()});\n`;
        }
      }
    }
    return code;
  }
  /**
   * 串行
   * @returns
   */
  callTapsSeries() {
    const taps = this.options.taps;
    let code = "";
    for (let i = 0; i < taps.length; i++) {
      const tapContent = this.#callTap(i);
      code += tapContent;
    }
    return code;
  }
  /**
   * 并行的执行taps
   */
  callTapsParallel({ onDone } = { onDone: () => "_callback();" }) {
    const taps = this.options.taps;
    let code = `var _counter = ${taps.length};`;
    code += `
    var _done = (function (){
      // _callback();
      ${onDone()}
    });
    `;
    for (let i = 0; i < taps.length; i++) {
      const tapContent = this.#callTap(i);
      code += tapContent;
    }
    return code;
  }
  #callTap(tapIndex) {
    const tapInfo = this.options.taps[tapIndex];
    let code = "";
    const interceptors = this.options.interceptors;
    if (interceptors.length) {
      code = `var _tap${tapIndex} = _taps[${tapIndex}];\n`;
      for (let i = 0; i < interceptors.length; i++) {
        const interceptor = interceptors[i];
        if (interceptor.tap) {
          code += `_interceptors[${i}].tap(_tap${tapIndex});\n`;
        }
      }
    }
    code += `
    var _fn${tapIndex} = _x[${tapIndex}];
    `;
    switch (tapInfo.type) {
      case "sync":
        code += `_fn${tapIndex}(${this.#args()});\n`;
        break;
      case "async":
        code += `_fn${tapIndex}(${this.#args()}, (function (){
          if(--_counter === 0) _done();
        }));\n`;
        break;
      case "promise":
        code += `
          var _promise${tapIndex} = _fn${tapIndex}(${this.#args()});
          _promise${tapIndex}.then(() => {
            if(--_counter === 0) _done();
          });
        `;
        break;
    }
    return code;
  }
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[],interceptors:any[]}} options
   */
  #init(options) {
    this.options = options;
  }
  /**
   *
   * @param {{type:"sync"|"async"|"promise",taps:Array<Function>, args:string[]}} options
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
        // 追加一个形参 _callback 也可以认为是next函数 执行就调用下一个事件函数
        fn = new Function(
          this.#args({ after: "_callback" }),
          this.#header() + this.content({ onDone: () => "_callback();\n" })
        );
        break;
      case "promise":
        const tapsContent = this.content({ onDone: () => "resolve();\n" });
        let content = `
        return new Promise((resolve, reject) => {
          ${tapsContent}
        });
        `;
        fn = new Function(this.#args(), this.#header() + content);
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
