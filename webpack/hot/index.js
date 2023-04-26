
const hotEmitter = require('./emitter')
hotEmitter.on('webpackHotUpdate', currentHash => {
  console.log('hot dev server 收到了最新的hash', currentHash)
  // 热更新检查
  hotCheck()
})