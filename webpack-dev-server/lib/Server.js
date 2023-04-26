const express = require('express')
const http = require('http')
const WebSocketIO = require('socket.io')
const updateCompiler = require('./utils/updateComplier')
const webpackDevMiddleware = require('../../webpack-dev-middleware/index.js')
class Server{
  constructor(compiler, devServerArgs){
    this.sockets = []
    this.compiler = compiler
    this.devServerArgs = devServerArgs
    updateCompiler(compiler)
    this.setupHooks() // 开始启动webpack的编译
    this.setupApp()
    this.routes()
    this.setupDevMiddleware() // 开发中间件
    this.createServer()
    this.createSocketServer()
  }
  createSocketServer(){
    // websocket 在通信之前要握手，握手的时候用http协议
    const websocketServer = WebSocketIO(this.server)
    // 监听客户端的连接
    websocketServer.on('connection', socket => {
      websocketServer.on('disconnect', () => {
        const index = this.sockets.indexOf(socket)
        this.sockets.splice(index, 1)
      })
      console.log('新的客户端来连接了')
      this.sockets.push(socket)
      // 如果以前编译过 就直接发给客户端
      if (this._stats) {
        // 给客户端发消息
        socket.emit('hash', this._stats.hash)
        socket.emit('ok')
      }
    })
  }
  setupHooks(){
    // 监听编译成功的事件
    this.compiler.hooks.done.tap('webpack-dev-server', stats => {
      console.log('新的编译完成，stats.hash:', stats.hash)
      // 每次编译完成都把新的stats中不同的部分发给客户端
      // 最新的打包hash和ok
      this.sockets.forEach(socket=>{
        socket.emit('hash', stats.hash)
        socket.emit('ok')
      })
      this._stats = stats // 记录stats
    })
  }
  setupDevMiddleware(){
    this.middleware = webpackDevMiddleware(this.compiler)
    this.app.use(this.middleware)
  }
  routes(){
    if (this.devServerArgs.static) {
      // 此目录会成为静态文件的根目录
      this.app.use(express.static(this.devServerArgs.static.directory))
    }
  }
  setupApp(){
    // app其实在这里就是一个路由中间件而已
    this.app = express()
  }
  createServer(){
    this.server = http.createServer(this.app)
  }
  listen(port, host, callback){
    this.server.listen(port, host,callback)
  }
}

module.exports = Server