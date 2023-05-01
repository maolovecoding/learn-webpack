const babel = require('@babel/core')
const path = require('path')
function babelLoader(source){
  // 拿到loader的参数
  const options = this.getOptions()
  const callback = this.async()
  babel.transformAsync(source, options).then(({code,ast,map})=>{
    callback(null, code, ast, map)
  })
}
module.exports = babelLoader

function babelLoaderSync(source){
  // 拿到loader的参数
  const options = this.getOptions()
  const { code } = babel.transformSync(source, options)
  return code
}