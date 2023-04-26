const mime = require('mime')
const path = require('path')
/**
 * 
 * @param {*} context 
 * @returns 负责提供产出文件的预览
 * 拦截http请求 看请求的文件是不是webpack打包的文件
 * 是的话从fs中读出来 返回给客户端
 */
function wrapper(context) {
  const { fs, outputPath } = context
  // 返回中间件
  return (req, res, next) => {
    const url = req.url === '/' ? '/index.html' : req.url // /main.js
    const filename = path.join(outputPath, url)
    try {
      const stats = fs.statSync(filename)
      if (stats.isFile()) {
        const content = fs.readFileSync(filename)
        res.setHeader('Content-Type', mime.getType(filename))
        res.send(content)
      } else {
        res.sendStatus(404)
      }
    }
    catch (error) {
      res.sendStatus(404)
    }
    next()
  }
}
module.exports = wrapper