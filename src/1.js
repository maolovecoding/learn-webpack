const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");

const sourceCode = "function ast(){}";
const ast = esprima.parse(sourceCode);
// console.log(ast);
// 遍历ast
let indent = 0;
let padding = () => " ".repeat(indent);
// 深度优先遍历
estraverse.traverse(ast, {
  enter(node) {
    console.log(padding() + node.type + "进入");
    indent += 2;
  },
  leave(node) {
    indent -= 2;
    console.log(padding() + node.type + "离开");
  },
});
