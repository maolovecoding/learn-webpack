const hotEmitter = require('../../webpack/hot/emitter')
// 通过websocket客户端连接服务器端
const socket = io('http://localhost:9000/')
// 最新的hash
let currentHash
socket.on('hash', hash => {
  console.log('客户端据此hash消息')
  currentHash = hash
})
socket.on('ok', () => {
  console.log('客户端收到此ok小溪')
  reloadApp()
})

function reloadApp(){
  hotEmitter.emit('webpackHotUpdate', currentHash)
}