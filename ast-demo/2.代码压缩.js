const core = require('@babel/core')
const types = require('@babel/types')
const path = require('path')

// 代码压缩插件
const uglifyPlugin = require('./uglifyPlugin')

const sourceCode = `
  var isReactElement = false
`
// 干掉console.log
const { code } = core.transformSync(sourceCode, {
  plugins: [uglifyPlugin()]
})
console.log(code)