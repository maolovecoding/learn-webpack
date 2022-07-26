const less = require("less");
function lessLoader(lessContent) {
  // 1. 同步转为异步loader  2. 返回一个callback 调用callback向下一个loader传递参数
  const callback = this.async();
  // console.log(this.resource, this.resourcePath); // 一样的
  // 看似异步  实际上 less.render的执行是同步的，包括回调也是同步执行
  // 如果不想用异步loader 其实用一个变量在回调中接收返回值，在下面直接return 也是可以的
  // let css;
  less.render(lessContent, { filename: this.resource }, (err, output) => {
    // less转为css交给下一个loader
    // console.log(output);
    // callback(err, output.css);
    // css = `module.exports = ${JSON.stringify(output.css)}`
    // 直接返回一个 脚本字符串 （可以认为是模块导出了）
    callback(err, `module.exports = ${JSON.stringify(output.css)}`);
  });
  // return css;
}

module.exports = lessLoader;
