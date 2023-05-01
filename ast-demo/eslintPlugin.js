
module.exports = function eslintPlugin({fix}){
  return {
    pre(file){
      file.set('errors', [])
    },
    visitor:{
      // 调用表达式
      CallExpression(path, state) {
        const {node} = path
        const errors = state.file.get('errors')
        if (node.callee.object?.name === 'console'){
          Error.stackTraceLimit = 0 // 清除调用栈
          errors.push(
            path.buildCodeFrameError(`代码中不能出现console.log语句`)
          )
          // 错误可以修复
          if (fix) {
            console.log(path.parentPath.type)
            path.parentPath.remove()
          }
        }
      }
    },
    post(file) {
      console.log(file.get('errors'))
    }
  }
}