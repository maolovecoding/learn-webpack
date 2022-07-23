const Compiler = require("./Compiler");

/**
 *
 * @param {*} options 配置对象
 */
function webpack(options) {
  // 1. 初始化参数，从配置文件和shell语句中读取并合并参数，并得到最终的配置对象
  const argv = process.argv.slice(2);
  const shellOptions = argv.reduce((shellOpts, options) => {
    const [key, value] = options.split("=");
    shellOpts[key.slice(2)] = value;
    return shellOpts;
  }, {});
  // 拿到最终的配置对象
  const finalOptions = { ...options, ...shellOptions };
  // 2. 用上一步的对象初始Compiler对象
  const compiler = new Compiler(finalOptions);
  // 3. 加载所有的插件
  const { plugins } = finalOptions;
  for (const plugin of plugins) {
    plugin.apply(compiler);
  }
  return compiler;
}

module.exports = webpack;
