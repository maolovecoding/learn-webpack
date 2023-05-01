const Compiler = require("./Compiler")

function webpack(options){
  // 1. 初始化参数 config + shell --mode=development
  const argv = process.argv.slice(2)
  const shellOptions = argv.reduce((shellOptions, options) => {
    const [key, val] = options.split('=')
    shellOptions[key.slice(2)] = val
    return shellOptions
  }, {})
  const finalOptions = {...options, ...shellOptions }
  // 2. compiler
  const compiler = new Compiler(finalOptions)
  // 3. 加载插件
  const { plugins } = finalOptions
  for (const plugin of plugins){
    plugin.apply(compiler)
  }
  return compiler
}

module.exports = webpack