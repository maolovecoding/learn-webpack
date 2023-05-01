const core = require('@babel/core')
const types = require('@babel/types')
const path = require('path')

const eslintPlugin = require('./eslintPlugin')

const sourceCode = `
  var a = 1
  console.log(a)
  var b = 2;
`
// 干掉console.log
const { code } = core.transformSync(sourceCode, {
  // fix 自动修复
  plugins: [eslintPlugin({ fix: true })]
})
console.log(code)