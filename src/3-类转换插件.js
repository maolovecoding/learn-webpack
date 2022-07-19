// babel核心包 语法树的生成 遍历 转换 修改 和生成源代码
const core = require("@babel/core");
// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");

class Person {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
}
const sourceCode = Person.toString();

// -------------------------------转换类的插件------------------------------
const transformClassPlugin = {
  visitor: {
    // 捕获类的声明
    ClassDeclaration(nodePath) {
      const { node } = nodePath;
      // Identifier Person
      const id = node.id;
      // console.log(id);
      // 类方法
      const classMethods = node.body.body;
      const nodes = [];
      classMethods.forEach((method) => {
        // 构造函数方法
        if (method.kind === "constructor") {
          // 函数声明 构造函数
          const constructorFunction = types.functionDeclaration(
            id,
            method.params,
            method.body,
            method.generator,
            method.async
          );
          nodes.push(constructorFunction);
        } else {
          // 普通函数
          const left = types.memberExpression(
            // Person.prototype.getName
            types.memberExpression(id, types.identifier("prototype")),
            method.key
          );
          // 函数表达式
          const right = types.functionExpression(
            method.key,
            method.params,
            method.body,
            method.generator,
            method.async
          );
          const assignmentExpression = types.assignmentExpression(
            "=",
            left,
            right
          );
          nodes.push(assignmentExpression);
        }
      });
      // 替换节点 一个类节点 -> 多个节点
      nodePath.replaceWithMultiple(nodes);
    },
  },
};

const target = core.transform(sourceCode, {
  plugins: [transformClassPlugin],
});
console.log(target.code);
