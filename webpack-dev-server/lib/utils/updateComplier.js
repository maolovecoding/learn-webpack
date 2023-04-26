const path = require('path')

module.exports = function updateCompiler(compiler){
  const options = compiler.options
  console.log('----------------------xxxxxxxxxxx')
  // 来着webpack-dev-server/client/index.js 就是浏览器的websocket客户端
  options.entry.main.import.unshift(
    require.resolve('../../client/index.js')
  )
  // webpack/hot/dev-server.js 用来在浏览器监听发射的事件 进行后续的热更新逻辑
  options.entry.main.import.unshift(
    require.resolve('../../../webpack/hot/index.js')
  )
  // 把入口变更之后 你要通知webpack按新的入口进行编译
  compiler.hooks.entryOption.call(options.context, options.entry)
}