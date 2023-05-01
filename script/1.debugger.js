const webpack = require('../mywebpack/webpack')
const path = require('path')
const webpackConfig = require('../webpack.config')

const compile = webpack(webpackConfig)
compile.run((err, stats) => {
  console.log(err)
  console.log(
    stats.toJson({
      files: true, // 打包后的生成的文件
      assets: true, // 一个代码块到文件的对应关系
      chunks: true, // 从入口模块触发，找到依赖的模块，依赖的依赖的模块 合并
      modules: true, // 打包的模块
    })
  )
})