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
  #args({ after } = {}) {
    const { args } = this.options;
    const allArgs = args.slice(0);
    if (after) {
      allArgs.push(after);
    }
    return allArgs.join(", ");
  }
  #header() {
    return `
    // header
    var _x = this._x;\n`;
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
    let code = `
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
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
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
