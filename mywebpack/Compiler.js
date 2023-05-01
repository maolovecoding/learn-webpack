const { SyncHook } = require('tapable')
const Compilation = require('./Compilation')
const fs = require('fs')
const path = require('path')

class Compiler{
  constructor(options){
    this.options = options
    this.hooks = {
      run: new SyncHook(), // 编译之前调用
      done: new SyncHook()
    }
  }
  run(callback) {
    this.hooks.run.call() // 触发run钩子
    // 在编译的过程中会收集所有依赖的模块
    const onCompiled = (err, stats, fileDependencies) => {
      // 在确定好输出内容后 根据配置确定输出的路径和文件名 写入文件系统
      for(const filename in stats.assets) {
        const filePath = path.join(this.options.output.path, filename)
        if (!fs.existsSync(this.options.output.path)) fs.mkdirSync(this.options.output.path)
        fs.writeFileSync(filePath, stats.assets[filename], 'utf8')
      }
      callback(err, {
        toJson(){
          return stats
        }
      })
      this.hooks.done.call() // 触发done钩子
      fileDependencies.forEach(fileDependency => {
        // 监听依赖的文件变化 
        fs.watch(fileDependency, () => {
          this.compile(onCompiled)
        })
      })
    }
    // 开始编译
    this.compile(onCompiled)
  }
  // 开启一次新的编译
  compile(callback){
    // 每次编译都创建一个新的 compilation 实例
    const compilation = new Compilation(this.options, this)
    compilation.build(callback)
  }
}

module.exports = Compiler