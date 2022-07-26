const core = require("@babel/core");
const { getOptions } = require("loader-utils");
/**
 * 
 * @param {*} source 源代码
 * @param {*} inputSourceMap 上一个loader的source-map文件
 */
function babelLoader(source, inputSourceMap) {
  // this 就是loader函数的this指针，loaderContext对象
  // const options = getOptions(this); // 老的获取options的方式
  // 新的方式获取 当前loader的options
  const options = this.getOptions();
  const loaderOptions = {
    ...options,
    inputSourceMap, // 上一个loader的source-map 没有该选项 就是直接生成了
    sourceMap: true, // 基于上一个source-map 生成自己的 source-map 多个source-map的生成必然消耗性能
    filename: this.resourcePath, // 映射为的源文件名
  };
  // code 转义后的代码 map 源代码和转换后代码的映射文化  ast 抽象语法树
  const { code, map, ast } = core.transform(source, loaderOptions);
  // console.log(map);
  // 通过callback的形式 可以传递多个参数给下一个loader 也是同步的
  this.callback(null, code, map, ast);
  // return source;
}

module.exports = babelLoader;
