// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");

module.exports = function () {
  return {
    visitor,
  };
};
const visitor = {
  /**
   * 当babel遍历语法树的时候，当遍历到 ImportDeclaration 导入声明节点时候会执行此函数
   * @param {*} nodePath
   * @param {*} state
   */
  ImportDeclaration(nodePath, state) {
    // 拿到node
    const { node } = nodePath;
    // 获取导入标识符
    const { specifiers } = node;
    // 获取webpack配置文件中配置的参数
    const { libraryName, libraryDirectory = "lib" } = state.opts;
    // 按需加载的 且当前导入不是默认导入
    if (
      node.source.value === libraryName &&
      !types.isImportDefaultSpecifier(specifiers[0])
    ) {
      const declarations = specifiers.map((specifier) => {
        return types.importDeclaration(
          [types.importDefaultSpecifier(specifier.local)],
          types.stringLiteral(
            // `${libraryName}/${libraryDirectory}/${specifier.imported.name}`
            [libraryName, libraryDirectory, specifier.imported.name]
              .filter(Boolean)
              .join("/")
          )
        );
      });
      nodePath.replaceWithMultiple(declarations);
    }
  },
};
