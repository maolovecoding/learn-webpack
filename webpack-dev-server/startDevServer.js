// 1. 准备创建开发服务器
const webpack = require('webpack')
const Server = require('./lib/Server')
const config = require('../webpack.config')

function startDevServer(compiler, config){
  const devServerArgs = config.devServer || {}
  // 3. 启动http服务器 里面还会负责打包我们的项目并提供预览服务，通过它访问打包后的文件
  const server = new Server(compiler, devServerArgs)
  const {port = 8080, host = 'localhost'} = devServerArgs
  server.listen(port, host, err => {
    console.log(`server running at http://${host}:${port}`)
  })
}
// 2. 创建webpack实例
const compiler = webpack(config)
// 3. 启动http服务器
startDevServer(compiler, config)

module.exports = startDevServer