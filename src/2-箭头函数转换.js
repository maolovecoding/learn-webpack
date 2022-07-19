// babel核心包 语法树的生成 遍历 转换 修改 和生成源代码
const core = require("@babel/core");
// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");

// const sourceCode = `
// const sum = (a, b) => {
//   const getThis = ()=>{
//     console.log(this)
//   }
//   return a + b
// }
// `;
// const target = core.transform(sourceCode, {
//   plugins: ["babel-plugin-transform-es2015-arrow-functions"],
// });
// console.log(target.code)

// --------------------------实现箭头函数转换插件
const sourceCode = `
const sum = (a, b) =>  a + b
`;
const transformEs2015ArrowFunctions = {
  // 需要有一个访问器对象
  visitor: {
    // type 箭头函数表达式的捕获 捕获到就执行该回调
    ArrowFunctionExpression(path) {
      // path是当前的位置
      // path一般不会改变 但是里面的节点可以改变
      // path也就类似于小区的每一层房间 node就是每个房间可以住的人
      const { node } = path;
      // 函数表达式
      node.type = "FunctionExpression";
      // this的获取
      hoistFunctionEnvironment(path);
      // 函数体不是语句块
      if (!types.isBlockStatement(node)) {
        node.body = types.blockStatement([types.returnStatement(node.body)]);
      }
    },
  },
};
/**
 * 提升函数的作用域环境
 * @param {*} path
 */
const hoistFunctionEnvironment = (path) => {
  // 1. 确定用哪里的this 向上找 找不是箭头函数的函数 或者根节点
  const thisEnv = path.findParent((parent) => {
    // 是函数 不是箭头函数 或者是根节点
    return (
      (parent.isFunction() && !path.isArrowFunctionExpression()) ||
      parent.isProgram()
    );
  });

  let thisPaths = getThisPaths(path);
  if (thisPaths.length > 0) {
    let thisBindings = "_this";
    if (!thisEnv.scope.hasBinding(thisBindings)) {
      thisEnv.scope.push({
        // 标识符 变量名 _this 值 就是当前环境的this
        id: types.identifier(thisBindings),
        init: types.thisExpression(),
      });
    }
    thisPaths.forEach((thisPath) => {
      // this -> _this
      thisPath.replaceWith(types.identifier(thisBindings));
    });
  }
};
const getThisPaths = (path) => {
  const thisPaths = [];
  // 遍历当前路径的子路径 找到使用this的
  path.traverse({
    ThisExpression(path) {
      thisPaths.push(path);
    },
  });
  return thisPaths;
};
const target = core.transform(sourceCode, {
  plugins: [transformEs2015ArrowFunctions],
});
console.log(target.code);
