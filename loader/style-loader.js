
function styleLoader(source){

}

styleLoader.pitch = function(remainingRequest){
  // 路径变为从根目录出发的相对路径
  // 只用行内loader 不用rule配置的loader了 不然会死循环
  const request = "!!"+(
    remainingRequest.split('!').map(req => {
      return this.utils.contextify(this.context, req)
    }).join('!')
  )
  const script = `
  const styleCss = require(${JSON.stringify(request)})
  const style = document.createElement('style')
  style.innerHTML = styleCss
  document.head.appendChild(style)
  `
  return script
}

module.exports = styleLoader
