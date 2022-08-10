const { ExternalModule } = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
/**
 * 1. 收集项目中的依赖模块，取和插件配置文件中的交集
 * 2. 修改外联模块的身材过程，把他们变成一个外部模块
 * 3. 修改产出的html文件，往html里插入cdn脚本的url地址
 */
module.exports = class WebpackExternalPlugin {
  constructor(options) {
    this.options = options;
    this.externalModules = Object.keys(options); //["lodash"]
    // 项目中真正用到的模块
    this.importModules = new Set();
  }
  apply(compiler) {
    // 每个文件对应一个模块 每个模块对应一个工厂
    compiler.hooks.normalModuleFactory.tap(
      "webpackExternalPlugin",
      (normalModuleFactory) => {
        // 拿到解析器 parser
        normalModuleFactory.hooks.parser // ast语法解析器的 hookMap
          .for("javascript/auto") // key是模块类型 javascript/auto 表示普通的js模块 值是一个钩子
          .tap("webpackExternalPlugin", (parser) => {
            // statement import _ from "lodash"
            // source lodash
            parser.hooks.import.tap(
              "webpackExternalPlugin",
              (statement, source) => {
                if (this.externalModules.includes(source)) {
                  this.importModules.add(source);
                }
              }
            );
            // require("jquery")
            parser.hooks.require.tap("webpackExternalPlugin", (expression) => {
              const source = expression.arguments[0].value; // source = jquery
              if (this.externalModules.includes(source)) {
                this.importModules.add(source);
              }
            });
          });
        normalModuleFactory.hooks.factorize.tapAsync(
          "webpackExternalPlugin",
          (resolveData, callback) => {
            // 要生产的模块
            const { request } = resolveData;
            // 导入的是我们可以处理的外部模块 则生产一个外部模块返回
            if (this.importModules.has(request)) {
              const { varName } = this.options[request];
              // 是我们需要外链的外部模块 则创建一个外部模块直接返回
              callback(null, new ExternalModule(varName, "window", request)); // 变量名 全局变量 模块名
            } else {
              // 普通模块 走正常生产模块的流程
              callback(null);
            }
          }
        );
      }
    );
    compiler.hooks.compilation.tap("webpackExternalPlugin", (compilation) => {
      // 编写插件的插件 在 HtmlWebpackPlugin 插件上改变输出的标签名
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
        "webpackExternalPlugin",
        (htmlData, callback) => {
          Object.keys(this.options)
            .filter((key) => this.importModules.has(key))
            .forEach((key) => {
              htmlData.assetTags.scripts.unshift({
                tagName: "script",
                voidTag: false,
                attributes: {
                  defer: false,
                  src: this.options[key].url,
                },
              });
            });
          callback(null, htmlData);
        }
      );
    });
  }
};
