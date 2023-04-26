const MemoryFileSystem = require('memory-fs')
const middleware = require('./middleware')
// 内存fs系统
const memoryFs = new MemoryFileSystem()
const fs = require('fs')
/**
 * webpack 开发中间件
 * 1. 真正的以监听模式启动webpack的编译
 * 2. 返回一个express中间件 用来预览我们产出的资源文件
 */
function webpackDevMiddleware(compiler){
  compiler.watch({}, () => {
    console.log('监听到文件变化 重新编译')
  })
  // 为了性能 产出的文件是在内存中 硬盘上是看不见的
  const fs = compiler.outputFileSystem = memoryFs
  return middleware({
    fs,
    outputPath: compiler.options.output.path // 写入到那个目录里面
  })
}

module.exports = webpackDevMiddleware