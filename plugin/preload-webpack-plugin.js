const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

class PreloadWebpackPlugin {
  apply(compiler){
    compiler.hooks.compilation.tap('PreloadWebpackPlugin', compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tap('PreloadWebpackPlugin', (htmlData)=>{
        const chunks = compilation.chunks
        // 所有代码块对应的所有文件 过滤掉同步模块
        const files = chunks.filter(chunk=>!chunk.canBeInitial()).reduce((files, chunk)=>{
          return files.add(...chunk.files)
        }, new Set())
        files.forEach(file=>{
          htmlData.assetTags.styles.push({
            tagName: 'link', 
            attributes: {
              rel: 'preload',
              href: file
            }
          })
        })
      })
    })
  }
}
module.exports = PreloadWebpackPlugin