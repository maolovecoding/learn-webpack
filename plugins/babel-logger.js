// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");
const path = require("path");
module.exports = function () {
  return {
    visitor,
  };
};
const visitor = {
  /**
   * 捕获console.log
   * @param {*} nodePath
   * @param {*} state
   */
  CallExpression(nodePath, state) {
    const { node } = nodePath;
    // 成员表达式
    if (types.isMemberExpression(node.callee)) {
      // 是console
      if ((name = node.callee.object.name === "console")) {
        // 方法是 log 等
        if (
          ["log", "debug", "info", "warn", "error"].includes(
            node.callee.property.name
          )
        ) {
          const { line, column } = node.loc.start; // 起始位置信息
          // 获取文件名
          const filename = path
            .relative(path.resolve("."), state.file.opts.filename)
            .replace(/\\/g, "/")
            .replace(/\.\./, "");
          // 在前面添加参数
          node.arguments.unshift(
            types.stringLiteral(`${filename}: ${line}: ${column}`)
          );
        }
      }
    }
  },
};
