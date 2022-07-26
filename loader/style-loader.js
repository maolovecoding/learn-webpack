// const { stringifyRequest } = require("loader-utils");
const path = require("path");
function styleLoader(cssContent) {
  // const script = `
  //   const style = document.createElement("style");
  //   style.innerHTML = ${JSON.stringify(cssContent)};
  //   document.head.append(style);
  // `;
  // return script;
}
/**
 * @param {*} remainingRequest 剩下的 request 还没执行的loader
 */
styleLoader.pitch = function (remainingRequest) {
  // F:\vscode\webFile\webpack\learn-webpack\loader\less-loader.js!F:\vscode\webFile\webpack\learn-webpack\src\index.less
  console.log(remainingRequest);
  // "!!../loader/less-loader.js!./index.less"
  console.log(stringifyRequest(this, "!!" + remainingRequest));
  // style-loader less-loader index.less
  // 剩下没执行的 就是 less-loader!index.less
  // webpack会再次解析这个模块index.less，而且因为 !! 只会走行内loader了
  // 相当于走了两次loader的流程：第一次走到style.pitch这个环节就结束了，第二次只走less-loader了
  const script = `
    const style = document.createElement("style");
    style.innerHTML = require(${stringifyRequest(
      this,
      "!!" + remainingRequest
    )});
    document.head.append(style);
  `;
  return script;
};
function stringifyRequest(loaderContext, request) {
  const splitted = request.replace(/^-?!+/, "").split("!");
  // 项目根路径
  const { context } = loaderContext;
  return JSON.stringify(
    "!!" +
      splitted
        .map((part) => {
          part = path.relative(context, part);
          if (part[0] !== ".") part = "./" + part;
          return part.replace(/\\/g, "/");
        })
        .join("!")
  );
}

module.exports = styleLoader;
