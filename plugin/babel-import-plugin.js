const types = require('@babel/types')
const visitor = {
  // 导入表达式
  ImportDeclaration(path, state){
    // 传给插件的参数
    const { libraryName, libraryDirectory = 'lib' } = state.opts
    const { node } = path
    // 导入的变量 { flatten, concat }
    const { specifiers } = node
    // 包名一致
    if (libraryName === node.source.value 
      && !types.isImportDefaultSpecifier(specifiers[0])) {
      // 此节点导入的包名和配置的按需加载包名是一样的，并且不是默认导入
      const importDeclarations = specifiers.map(specifier => {
        // 新的导入声明
        return types.importDeclaration([
          types.importDefaultSpecifier(types.identifier(specifier.local))
        ], types.stringLiteral(
          [libraryName, libraryDirectory, specifier.imported.name]
              .filter(Boolean)
              .join("/")
        ))
      })
    console.log(importDeclarations.imported.name, '---------------')
      // 多行替换一行导入声明
      path.replaceWithMultiple(importDeclarations)
    }
  }
}

module.exports = function(){
  return {
    visitor
  }
}