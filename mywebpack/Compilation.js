const path = require('path')
const fs = require('fs')
const parser = require("@babel/parser")
const types = require("@babel/types")
const traverse = require("@babel/traverse")
const generator = require("@babel/generator")
const baseDir = process.cwd().replace(/\\/g, '/')
class Compilation{
  constructor(options,compiler) {
    this.options = options
    this.compiler = compiler
    this.modules = [] // 本次编译涉及的所有模块
    this.chunks = [] // 本次编译所组装出的所有代码块
    this.assets = {} // key文件名 value文件内容
    this.files= [] // 本次编译产生的文件
    this.fileDependencies = [] // 本次编译依赖的文件
  }
  build(callback){
    let entry = {}
    if (typeof this.options.entry === 'string') {
      entry.main = this.options.entry
    } else {
      entry = {...this.options.entry }
    }
    for (const entryName in entry) {
      const entryFilePath = path.posix.join(baseDir, entry[entryName])
      this.fileDependencies.push(entryFilePath)
      // 对模块编译 调用loader工作
      const entryModule = this.buildModule(entryName, entryFilePath)
      this.modules.push(entryModule)
      // 8 根据入口和模块的依赖关系 组装成一个个包含多个模块的 chunk
      const chunk = {
        name: entryName,
        entryModule,
        modules: this.modules.filter(module=>module.names.includes(entryName))
      }
      this.chunks.push(chunk)
    }
    this.chunks.forEach(chunk => {
      const filename = this.options.output.filename.replace('[name]',chunk.name)
      this.assets[filename] = getSource(chunk)
      this.files.push(filename)
    })
    callback(null, {
      modules: this.modules,
      chunks: this.chunks,
      assets: this.assets,
      files: this.files,
    }, this.fileDependencies)
  }
  /**
   * 编译模块
   * @param {*} name 模块代码块的名称
   * @param {*} modulePath 路径
   */
  buildModule(name, modulePath){
    // 读取文件内容
    let sourceCode = fs.readFileSync(modulePath, 'utf-8')
    const rules = this.options.module.rules
    const loaders = []
    rules.forEach(rule => {
      if (modulePath.match(rule.test)){
        loaders.push(...rule.use)
      }
    })
    sourceCode = loaders.reduceRight((sourceCode, loader)=>{
      return require(loader)(sourceCode)
    },sourceCode)
    // 找出模块依赖的模块
    // 当前模块的id
    const moduleId = './' + path.posix.relative(baseDir, modulePath)
    const module = {
      id: moduleId,
      dependencies: [],
      names: [name] // names 表示当前模块被那些模块所依赖 比如在index中依赖了title，那么title模块的names就有index
    }
    const ast = parser.parse(sourceCode, {
      sourceType: 'module'
    })
    const options = this.options
    traverse.default(ast, {
      CallExpression:({ node }) => {
        let depModulePath
        if (node.callee.name === 'require') {
          const depModuleName = node.arguments[0].value // ./title
          if (depModuleName.startsWith('.')){
            const currentDir = path.posix.dirname(modulePath)
          // 没考虑第三方模块
          depModulePath = path.posix.join(currentDir, depModuleName)
          // 拿到绝对路径 尝试添加后缀
          const extensions = options.resolve.extensions
          depModulePath = tryExtensions(depModulePath, extensions)
          } else {
            // 第三方模块
            depModulePath = require.resolve(depModuleName)
          }
          this.fileDependencies.push(depModulePath)
          // 依赖的模块id
          const depModuleId = './' + path.posix.relative(baseDir, depModulePath)
          // 修改依赖的模块名
          node.arguments = [types.stringLiteral(depModuleId)]
          // 把依赖的模块id和依赖的模块路径放到当前模块的依赖数组中
          module.dependencies.push({
            depModuleId, 
            depModulePath
          })
        }
      }
    })
    const { code } = generator.default(ast)
    module._code = code
    module.dependencies.forEach(({depModuleId,depModulePath})=>{
      // 判断依赖的模块是否编译过
      const existModule = this.modules.find(module => module.id === depModuleId)
      if (existModule) existModule.names.push(name)
      else {
        const depModule = this.buildModule(name,depModulePath)
        this.modules.push(depModule)
      }
    })
    return module
  }
}

function tryExtensions(modulePath, extensions){
  if (fs.existsSync(modulePath)) return modulePath // 文件存在
  for(let i = 0; i<extensions.length;i++){
    const filePath = modulePath + extensions[i]
    if (fs.existsSync(filePath)) return filePath
  }
  throw new Error(`找不到${modulePath}`)
}

function getSource(chunk){
  return `
  (() => {
    var modules = {
      ${chunk.modules.map(module => {
        return `
        "${module.id}": (module, exports, require) => {
          ${module._code}
        }
        `
      }).join(',')
    }
    };
    var cache = {};
    function require(moduleId) {
      var cachedModule = cache[moduleId];
      if (cachedModule !== undefined) {
        return cachedModule.exports;
      }
      var module = (cache[moduleId] = {
        exports: {},
      });
      modules[moduleId](module, module.exports, require);
      return module.exports;
    }
    var exports = {};
    (() => {
      ${chunk.entryModule._code}
    })();
  })();
  `
}
module.exports = Compilation