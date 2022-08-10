# learn webpack

## basic

### 基础的配置

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin")
module.exports = {
  mode: "development",
  // 单个入口
  entry: "./src/index.js",
  // 输出
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  // 对模块的处理
  module: {
    // loader
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  // 插件
  plugins:[
    // html插件
    new HtmlWebpackPlugin({
      template:path.resolve(__dirname, "public/index.html")
    })
  ]
};

```

### mode

1. 开发模式：development
2. 生产模式：production

配置方式：

1. 直接配置mode字段
2. --env指定

```json
{
  "build": "webpack --env=development"
}
```

配置通过函数返回值的形式，是考研在函数参数中拿到env参数的:

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = (env) => {
  console.log(env);
  return {
    mode: env.development ? "development" : "production",
    // 单个入口
    entry: "./src/index.js",
    // 输出
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
    },
    // 对模块的处理
    module: {
      // loader
      rules: [
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    // 插件
    plugins: [
      // html插件
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.html"),
      }),
    ],
  };
};
```

取值`process.env.NODE_ENV`有两个地方：

1. 模块文件内
2. webpack的配置文件里
该值是可以通过一个插件进行注入，值是任意的。插件是`webpack`提供好的。

```js
// 注入环境变量
new DefinePlugin({
  "process.env.NODE_ENV": JSON.stringify("development"),
}),
```

这样在模块内使用该变量的值的时候，就会替换为我们定义的值。
**记住：如果使用的是：`process.env.NODE_ENV: "development"`**，会替换为development变量，而不是字符串。

但是，如果在配置文件中获取该变量的值，是获取不到的。这个时候我们需要在启动的时候，设置环境变量：
win:  set NODE_ENV=development
mac:  export NODE_ENV=development
**为了支持跨平台，我们安装一个包：cross-env**
这样在配置文件和模块中就可以拿到注入的变量了。可以不通过插件注入同名变量了。**如果都设置了同一个变量，我们的插件的优先级更高。**

```json
{
  "build": "cross-env NODE_ENV=development webpack --env=development"
}
```

### dev server 和 css-loader

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 拷贝静态资源到打包目录
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
module.exports = (env) => {
  console.log(env);
  console.log(process.env.NODE_ENV);
  return {
    mode: env.development ? "development" : "production",
    // 单个入口
    entry: "./src/index.js",
    // 输出
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
      publicPath: "", // 默认是 "" 指定打包后的文件插入html文件时的访问路径前缀
    },
    // 对模块的处理
    module: {
      // loader
      rules: [
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              // css-loader的配置
              options: {
                url: true, // 处理url地址 false不处理 需要自己处理
                import: true, // false 自己处理import导入
                modules: false, // true 表示开启支持 css module 类名会变成hash形式
                sourceMap: true, // 生成sourcemap
                esModule: true, // true {default: css value} false 直接就是css value
                // 允许启用 或者禁用loader 或者设置启用的loader的数量 在css-loader前使用的loader个数
                importLoaders: true,
              },
            },
          ],
        },
        {
          test: /.\png$/,
          // 借助webpack5新特性 资源模块 类似 file-loader
          type: "asset/resource",
        },
        {
          // 类似 url-loader 可以把文件变成一个base64字符串 内嵌到html里面
          test: /\.ico$/,
          type: "asset/inline",
        },
        {
          test: /\.txt$/,
          // 类似 raw-loader 不对内容做任何处理
          type: "asset/source",
        },
        {
          test: /\.jpg$/,
          type: "asset",
          parser: {
            // 指定内联条件 如果引入的文件体积大于4k的话 就发射文件 小于4k就内联
            dataUrlCondition: {
              maxSize: 1024 * 4,
            },
          },
        },
      ],
    },
    // 插件
    plugins: [
      // html插件
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.ejs"),
      }),
      // 注入环境变量
      new DefinePlugin({
        // "process.env.NODE_ENV": JSON.stringify("development"),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "public"),
            to: path.resolve(__dirname, "dist"),
            filter: (filepath) => {
              console.log("------------------>", filepath);
              return !filepath.endsWith("ejs");
            },
            globOptions: {
              ignore: [path.resolve(__dirname, "public/index.ejs")],
            },
          },
        ],
      }),
    ],
    // 开发服务器
    devServer: {
      // 额外的 静态资源目录
      static: path.resolve(__dirname, "public"),
      port: 8080, // 端口号
      open: true, // 打包完毕后自动打开浏览器
    },
    resolve: {
      // 别名 访问项目内资源的别名 
      // 如果想访问 node_modules下面的文件 可以在加载资源路径的时候 采用 ~node module name 开头 后面跟具体资源 css-loader 的功能
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
};
```

### postcss

**css兼容性处理：**
需要借助一个很重要的工具，postcss

```shell
pnpm install postcss  postcss-loader postcss-preset-env -D
```

**postcss.config.js**:

```js
const postcssPresetEnv = require("postcss-preset-env");
module.exports = {
  plugins: [
    postcssPresetEnv({
      // 支持最新的五个版本
      browsers: "last 5 version",
    }),
  ],
};
```

**这里就不得不再提及一下前面我们css-loader的一个选项：importLoaders**:
在我们设置该选项的值为一个数字的时候，我们在css文件里面如果加载了其他css，比如`@import url`这种形式，那么如果这个数字为0，或者设置为false了。那么我们不会对导入的css应用css-loader前面的loader进行处理：比如 `postcss-loader`

### babel

安装会用到的一些库：

```shell
pnpm install babel-loader @babel/core @babel/preset-env @babel/preset-react -D
pnpm install @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties @babel/plugin-proposal-private-property-in-object @babel/plugin-proposal-private-methods -D
```

**babel-loader 的配置：**

```js
{
  test: /\.jsx?$/,
  use: {
    loader: "babel-loader",
    // 配置
    options: {
      // 配置预设
      presets: ["@babel/preset-env", "@babel/preset-react"],
      // 插件
      plugins: [
        [
          // 支持装饰器
          "@babel/plugin-proposal-decorators",
          // 插件的参数
          // legacy 表示使用旧的装饰器语法
          { legacy: true },
        ],
        [
          // 类属性
          "@babel/plugin-proposal-class-properties",
          { loose: true },
        ],
        [
          // 私有方法
          "@babel/plugin-proposal-private-methods",
          { loose: true },
        ],
        [
          // 私有属性
          "@babel/plugin-proposal-private-property-in-object",
          { loose: true },
        ],
      ],
    },
  },
},
```

**babel 是一个语法转换的引擎**，具体的转换规则是由插件决定的。每个插件可以转换一个语法。
但是插件一个个的配置比较麻烦，所以我们出现了预设：也就是多个插件的集合。

#### 装饰器

支持装饰器语法：**jsconfig.json**

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

**什么是装饰器：**

```js
function readonly(target, key, decorator) {
  // 属性不可重写
  decorator.writable = false;
}

class Number {
  @readonly
  PI = 3.14;
}

const n = new Number();
console.log(n.PI);
n.PI = 22; // 属性不可重写了
console.log(n.PI);
```

### ES Lint

```shell
pnpm install -D eslint eslint-loader babel-eslint 
```

```js
// 配置 eslint
{
  test: /\.jsx?$/,
  // use: {
  loader: "eslint-loader",
  options: {
    enforce: "pre",
    options: { fix: true },
    exclude: /node_modules/,
  },
  // },
},
```

### 服务器代理

如果你有单独的后端开发服务器API，并且希望在同域名下发送API请求，那么代理某些URL会很有用。

代理只有在开发模式才有效：

```js
// 开发服务器
devServer: {
  // 额外的 静态资源目录
  static: path.resolve(__dirname, "public"),
  port: 8080, // 端口号
  open: true, // 打包完毕后自动打开浏览器
  proxy: {
    // 配置代理
    // "/api": "http://localhost:7777",
    "/api": {
      target: "http://localhost:7777",
      // 路径重写
      pathRewrite: {
        "^/api": "",
      },
    },
  },
},
```

```js
// webpack-dev-serve 内部就是一个express服务器 这里可以模拟后端
onBeforeSetupMiddleware(devServer) {
  devServer.app.get("/users", (req, res) => {
    res.json({
      success: true,
      data: {
        name: "zs",
      },
    });
  });
},
```

### webpack 打包分析

#### commonjs

写一个很简单的代码：
**title.js**

```js
module.exports = "title";
```

**index.js**:

```js
const title = require("./title");
console.log(title);
```

**打包后的代码：去除注释后**：

```js
(() => {
  var __webpack_modules__ = {
    "./src/title.js": (module) => {
      module.exports = "title";
    },
  };
  var __webpack_module_cache__ = {};
  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (__webpack_module_cache__[moduleId] = {
      exports: {},
    });
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
  }
  var __webpack_exports__ = {};
  (() => {
    const title = __webpack_require__("./src/title.js");
    console.log(title);
  })();
})();
```

**整理，分析**：

```js
(() => {
  var modules = {
    // 模块名 路径 模块内容就是一个函数
    "./src/title.js": (module) => {
      module.exports = "title";
    },
  };
  // 模块缓存
  var cache = {};
  function require(moduleId) {
    // 加载模块前先查找缓存
    var cachedModule = cache[moduleId];
    if (cachedModule !== undefined) {
      // 有缓存直接返回
      return cachedModule.exports;
    }
    // 没有缓存 创建缓存对象 然后查找模块并执行
    var module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId](module, module.exports, require);
    return module.exports;
  }
  var exports = {};
  (() => {
    // 导入模块其实就是去我们的modules对象中找路径对应的函数并执行，拿到执行完的module.exports的结果
    const title = require("./src/title.js");
    console.log(title);
  })();
})();
```

#### ES Module to commonjs

导出的是ES Module规范，导入是commonjs规范：
**name.js**:

```js
export const name = "zs";
export const obj = {
  name,
  age: 22,
};
export default "name";
```

**index.js**:

```js
const nameDefault = require("./name");
console.log(nameDefault);
```

**打包产物分析：**有点妙了

```js
(() => {
  var modules = {
    "./src/name.js": (module, exports, require) => {
      "use strict";
      require.r(exports);
      // 将导出的属性通过函数返回值的形式拿到 意味着每次取值都是动态的获取 可以获取到最新值 妙了！
      require.d(exports, {
        default: () => _DEFAULT_EXPORT__,
        name: () => name,
        obj: () => obj,
      });
      const name = "zs";
      const obj = {
        name,
        age: 22,
      };
      // 定义默认导出
      const _DEFAULT_EXPORT__ = "name";
    },
  };
  var cache = {};
  function require(moduleId) {
    var cachedModule = cache[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId](module, module.exports, require);
    return module.exports;
  }
  (() => {
    require.d = (exports, definition) => {
      for (var key in definition) {
        // 需要导出的属性 不能是已经在exports上定义过的属性
        if (require.o(definition, key) && !require.o(exports, key)) {
          Object.defineProperty(exports, key, {
            // 可枚举 可以获取值 但是不允许在导入后更改
            enumerable: true,
            get: definition[key],
          });
        }
      }
    };
  })();
  (() => {
    // 判断属性是否是对象自身的属性
    require.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  })();
  (() => {
    require.r = (exports) => {
      // 定义es module 标识
      // exports[Symbol.toStringTag] = "Module"
      // exports["__esModule"] = true
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(exports, "__esModule", { value: true });
    };
  })();
  var exports = {};
  (() => {
    // commonjs 加载 es module的导出
    const nameDefault = require("./src/name.js");
    console.log(nameDefault);
  })();
})();
```

#### esModule to esModule

基本上没什么特殊的。取默认值的时候就是通过`["default"]`取值而已。

#### commonjs to esModule

**commonjs导出，es module导入**：
**common.js**:

```js
module.exports = {
  name: "zs",
  age: 22,
  friends: ["ls", "zl"],
};
```

**index.js**:

```js
import common, { name, age, friends } from "./common";
console.log(common, name, age, friends);
```

**打包产物分析：**

```js
(() => {
  var modules = {
    "./src/common.js": (module) => {
      module.exports = {
        name: "zs",
        age: 22,
        friends: ["ls", "zl"],
      };
    },
  };
  var cache = {};
  function require(moduleId) {
    var cachedModule = cache[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId](module, module.exports, require);
    return module.exports;
  }
  (() => {
    // 取模块的默认导出内容 如果是es模块 就直接取default然后做成getter 如果是commonjs形式 也做成getter的形式 返回模块本身
    require.n = (module) => {
      var getter =
        // es的默认导出已经是getter了
        module && module.__esModule ? () => module["default"] : () => module;
      // getter的a属性就是getter函数的返回值？？？
      // 也就是说：我们不执行getter 直接通过 getter.a 也能拿到结果
      // 为什么是 a ？ emmm 好像无所谓吧
      require.d(getter, { a: getter });
      return getter;
    };
  })();
  (() => {
    require.d = (exports, definition) => {
      for (var key in definition) {
        if (require.o(definition, key) && !require.o(exports, key)) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          });
        }
      }
    };
  })();
  (() => {
    require.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  })();
  (() => {
    require.r = (exports) => {
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(exports, "__esModule", { value: true });
    };
  })();
  var exports = {};
  (() => {
    "use strict";
    // 只要打包前的模块是一个 es module 就会调用 r方法进行处理 这里index就是es
    require.r(exports);
    var _common_0__ = require("./src/common.js");
    var _common_0___default = /*#__PURE__*/ require.n(_common_0__);
    console.log(
      _common_0___default(),
      // 通过 a 属性就可以拿到default返回值
      _common_0___default.a,
      _common_0__.name,
      _common_0__.age,
      _common_0__.friends
    );
  })();
})();
```

### 模块懒加载

webpack对使用import("xx")导入的模块会进行代码分割，也就是我们用到的时候才会加载这个模块。
**lazy1.js**:

```js
export default "hello";
```

**index.js**:模块懒加载的使用

```js
// 模块懒加载
import("./lazy1").then((module) => {
  console.log(module);
});
```

**lazy.bundle.js**:

```js
// self 在浏览器里面就是 window
(self["webpackChunklearn_webpack"] = self["webpackChunklearn_webpack"] || [])
  // 数组 二维结构 push方法就是jsonp回调的函数
  .push([
    ["lazy"],
    {
      // 懒加载的模块名
      "./src/lazy1.js": (module, exports, require) => {
        // 表名es module模块
        require.r(exports);
        // 定义默认导出
        require.d(exports, {
          default: () => _DEFAULT_EXPORT__,
          name: () => name,
        });
        const _DEFAULT_EXPORT__ = "hello";
        const name = "name";
      },
    },
  ]);
```

**模块懒加载的实现：**

```js
// 模块
var modules = {};
// 缓存
var cache = {};
debugger
// 浏览器的require方法
function require(moduleId) {
  var cachedModule = cache[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  var module = (cache[moduleId] = {
    exports: {},
  });
  modules[moduleId](module, module.exports, require);
  return module.exports;
}
// 通过 m属性可以访问存放模块的对象
require.m = modules;
// 定义属性
require.d = (exports, definition) => {
  for (var key in definition) {
    if (require.o(definition, key) && !require.o(exports, key)) {
      Object.defineProperty(exports, key, {
        enumerable: true,
        get: definition[key],
      });
    }
  }
};
// 存放所有异步加载的模块
require.f = {};
// e 方法可以异步加载模块 是一个promise
// promise成功后会把该模块放到 modules上（require.m）
// 调用require方法加载 lazy1模块，获取导出对象
require.e = (chunkId) => {
  // 实际异步加载是把所有f中的异步模块一起加载 但是获取可以单独拿到需要的模块
  return Promise.all(
    Object.keys(require.f).reduce((promises, key) => {
      require.f[key](chunkId, promises);
      return promises;
    }, [])
  );
};
// unique name 资源的唯一名称
require.u = (chunkId) => {
  return "" + chunkId + ".bundle.js";
};
require.g = (function () {
  if (typeof globalThis === "object") return globalThis;
  try {
    return this || new Function("return this")();
  } catch (e) {
    if (typeof window === "object") return window;
  }
})();
// 属性是自身的
require.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
var inProgress = {};
var dataWebpackPrefix = "learn-webpack:";
/**
 * 加载资源
 * @param {*} url 
 * @param {*} done 
 * @param {*} key 
 * @param {*} chunkId 
 * @returns 
 */
require.l = (url, done, key, chunkId) => {
  if (inProgress[url]) {
    inProgress[url].push(done);
    return;
  }
  var script, needAttach;
  if (key !== undefined) {
    // 创建脚本
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var s = scripts[i];
      if (
        s.getAttribute("src") == url ||
        s.getAttribute("data-webpack") == dataWebpackPrefix + key
      ) {
        script = s;
        break;
      }
    }
  }
  if (!script) {
    needAttach = true;
    script = document.createElement("script");
    script.charset = "utf-8";
    script.timeout = 120;
    if (require.nc) {
      script.setAttribute("nonce", require.nc);
    }
    script.setAttribute("data-webpack", dataWebpackPrefix + key);
    script.src = url;
  }
  inProgress[url] = [done];
  var onScriptComplete = (prev, event) => {
    script.onerror = script.onload = null;
    clearTimeout(timeout);
    var doneFns = inProgress[url];
    delete inProgress[url];
    script.parentNode && script.parentNode.removeChild(script);
    doneFns && doneFns.forEach((fn) => fn(event));
    if (prev) return prev(event);
  };
  var timeout = setTimeout(
    onScriptComplete.bind(null, undefined, {
      type: "timeout",
      target: script,
    }),
    // 超时时长 120s
    120000
  );
  script.onerror = onScriptComplete.bind(null, script.onerror);
  script.onload = onScriptComplete.bind(null, script.onload);
  // 将脚本添加到html中
  needAttach && document.head.appendChild(script);
};
require.r = (exports) => {
  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  }
  Object.defineProperty(exports, "__esModule", { value: true });
};
var scriptUrl;
if (require.g.importScripts) scriptUrl = require.g.location + "";
var document = require.g.document;
if (!scriptUrl && document) {
  if (document.currentScript) scriptUrl = document.currentScript.src;
  if (!scriptUrl) {
    var scripts = document.getElementsByTagName("script");
    if (scripts.length) scriptUrl = scripts[scripts.length - 1].src;
  }
}
if (!scriptUrl)
  throw new Error("Automatic publicPath is not supported in this browser");
scriptUrl = scriptUrl
  .replace(/#.*$/, "")
  .replace(/\?.*$/, "")
  .replace(/\/[^\/]+$/, "/");
// 资源的访问路径 public path 就是我们配置文件中的publicPath属性
require.p = scriptUrl;
// 存放加载代码块的状态
// key是代码块的名字
// value 是一个模块的加载状态 0表示准备就绪
var installedChunks = {
  // 就是index主模块
  main: 0,
};
/**
 * 加载远程模块（异步加载）的方法 其实就是JSONP
 * @param {*} chunkId 模块名
 * @param {*} promises promise数组
 */
require.f.j = (chunkId, promises) => {
  // 当前的代码块的数据
  var installedChunkData = require.o(installedChunks, chunkId)
    ? installedChunks[chunkId]
    : undefined;
  if (installedChunkData !== 0) {
    if (installedChunkData) {
      promises.push(installedChunkData[2]);
    } else {
      if (true) {
        // 创建promise
        var promise = new Promise(
          (resolve, reject) =>
            // installedChunks添加当前模块记录 id : [resolve, reject]
            (installedChunkData = installedChunks[chunkId] = [resolve, reject])
        );
        // 将promise放到异步的数组中
        // 且 将promise本身也放到当前代码块对象里面 [resolve, reject, promise]
        promises.push((installedChunkData[2] = promise));
        // 请求地址 资源访问路径 + 资源的唯一标识
        var url = require.p + require.u(chunkId);
        // 创建错误
        var error = new Error();
        var loadingEnded = (event) => {
          if (require.o(installedChunks, chunkId)) {
            installedChunkData = installedChunks[chunkId];
            if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
            if (installedChunkData) {
              var errorType =
                event && (event.type === "load" ? "missing" : event.type);
              var realSrc = event && event.target && event.target.src;
              error.message =
                "Loading chunk " +
                chunkId +
                " failed.\n(" +
                errorType +
                ": " +
                realSrc +
                ")";
              error.name = "ChunkLoadError";
              error.type = errorType;
              error.request = realSrc;
              installedChunkData[1](error);
            }
          }
        };
        require.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
      } else installedChunks[chunkId] = 0;
    }
  }
};
/**
 * jsonp方法的回调函数 
 * @param {*} parentChunkLoadingFunction 
 * @param {*} data
 */
var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
  // chunkIds 代码块ID数组
  // data 额外的模块定义
  var [chunkIds, moreModules, runtime] = data;
  var moduleId,
    chunkId,
    i = 0;
    // 不为0表示模块还没加载完毕
  if (chunkIds.some((id) => installedChunks[id] !== 0)) {
    for (moduleId in moreModules) {
      if (require.o(moreModules, moduleId)) {
        // m -> modules 将模块合并到modules上
        require.m[moduleId] = moreModules[moduleId];
      }
    }
    if (runtime) var result = runtime(require);
  }
  if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
  for (; i < chunkIds.length; i++) {
    // 拿到每个模块的id标识
    chunkId = chunkIds[i];
    if (require.o(installedChunks, chunkId) && installedChunks[chunkId]) {
      // resolve方法执行
      installedChunks[chunkId][0]();
    }
    // 表示模块加载完毕了 可以使用
    installedChunks[chunkId] = 0;
  }
};
// 全局正在懒加载的模块
var chunkLoadingGlobal = (self["webpackChunklearn_webpack"] =
  self["webpackChunklearn_webpack"] || []);

chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
chunkLoadingGlobal.push = webpackJsonpCallback.bind(
  null,
  // 回调的第一个参数 就是父模块的回调函数
  chunkLoadingGlobal.push.bind(chunkLoadingGlobal)
);
var exports = {};
require
  .e("lazy")
  .then(require.bind(require, "./src/lazy1.js"))
  .then((module) => {
    console.log(module);
  });
```

### AST

#### 常用的js parser

- esprima
- traceur
- acorn
- shift

#### AST遍历

**AST遍历是深度优先遍历的**：

```shell
pnpm install esprima estraverse escodegen -D
```

ast遍历：

```js
const esprima = require("esprima");
const estraverse = require("estraverse");
const escodegen = require("escodegen");

const sourceCode = "function ast(){}";
const ast = esprima.parse(sourceCode);
// console.log(ast);
// 遍历ast
let indent = 0;
let padding = () => " ".repeat(indent);
// 深度优先遍历
estraverse.traverse(ast, {
  enter(node) {
    console.log(padding() + node.type + "进入");
    indent += 2;
  },
  leave(node) {
    indent -= 2;
    console.log(padding() + node.type + "离开");
  },
});
```

### 安装babel

```shell
pnpm install @babel/core @babel/types -D
# 箭头函数转换插件
pnpm install babel-plugin-transform-es2015-arrow-functions -D
```

#### 实现箭头函数转换插件

**插件的使用**：

```js
// babel核心包 语法树的生成 遍历 转换 修改 和生成源代码
const core = require("@babel/core");
// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");

const sourceCode = "const sum = (a, b) => a + b";
const target = core.transform(sourceCode, {
  plugins: ["babel-plugin-transform-es2015-arrow-functions"],
});
console.log(target.code)
```

##### 实现

```js
// babel核心包 语法树的生成 遍历 转换 修改 和生成源代码
const core = require("@babel/core");
// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");
// const sourceCode = `
// const sum = (a, b) => {
//   const getThis = () => {
//     console.log(this)
//   }
//   return a + b
// }
// `;
// --------------------------实现箭头函数转换插件
const sourceCode = `
const sum = (a, b) =>  a + b
`;
const transformEs2015ArrowFunctions = {
  // 需要有一个访问器对象
  visitor: {
    // type 箭头函数表达式的捕获 捕获到就执行该回调
    ArrowFunctionExpression(path) {
      // path是当前的位置
      // path一般不会改变 但是里面的节点可以改变
      // path也就类似于小区的每一层房间 node就是每个房间可以住的人
      const { node } = path;
      // 函数表达式
      node.type = "FunctionExpression";
      // this的获取
      hoistFunctionEnvironment(path);
      // 函数体不是语句块
      if (!types.isBlockStatement(node)) {
        node.body = types.blockStatement([types.returnStatement(node.body)]);
      }
    },
  },
};
/**
 * 提升函数的作用域环境
 * @param {*} path
 */
const hoistFunctionEnvironment = (path) => {
  // 1. 确定用哪里的this 向上找 找不是箭头函数的函数 或者根节点
  const thisEnv = path.findParent((parent) => {
    // 是函数 不是箭头函数 或者是根节点
    return (
      (parent.isFunction() && !path.isArrowFunctionExpression()) ||
      parent.isProgram()
    );
  });

  let thisPaths = getThisPaths(path);
  if (thisPaths.length > 0) {
    let thisBindings = "_this";
    if (!thisEnv.scope.hasBinding(thisBindings)) {
      thisEnv.scope.push({
        // 标识符 变量名 _this 值 就是当前环境的this
        id: types.identifier(thisBindings),
        init: types.thisExpression(),
      });
    }
    thisPaths.forEach((thisPath) => {
      // this -> _this
      thisPath.replaceWith(types.identifier(thisBindings));
    });
  }
};
const getThisPaths = (path) => {
  const thisPaths = [];
  // 遍历当前路径的子路径 找到使用this的
  path.traverse({
    ThisExpression(path) {
      thisPaths.push(path);
    },
  });
  return thisPaths;
};
const target = core.transform(sourceCode, {
  plugins: [transformEs2015ArrowFunctions],
});
console.log(target.code);
```

#### 类编译为function插件

```shell
pnpm install -D @babel/plugin-transform-classes
```

**插件的实现方式：**

```js
// babel核心包 语法树的生成 遍历 转换 修改 和生成源代码
const core = require("@babel/core");
// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");
class Person {
  constructor(name) {
    this.name = name;
  }
  getName() {
    return this.name;
  }
}
const sourceCode = Person.toString();
// -------------------------------转换类的插件------------------------------
const transformClassPlugin = {
  visitor: {
    // 捕获类的声明
    ClassDeclaration(nodePath) {
      const { node } = nodePath;
      // Identifier Person
      const id = node.id;
      // console.log(id);
      // 类方法
      const classMethods = node.body.body;
      const nodes = [];
      classMethods.forEach((method) => {
        // 构造函数方法
        if (method.kind === "constructor") {
          // 函数声明 构造函数
          const constructorFunction = types.functionDeclaration(
            id,
            method.params,
            method.body,
            method.generator,
            method.async
          );
          nodes.push(constructorFunction);
        } else {
          // 普通函数
          const left = types.memberExpression(
            // Person.prototype.getName
            types.memberExpression(id, types.identifier("prototype")),
            method.key
          );
          // 函数表达式
          const right = types.functionExpression(
            method.key,
            method.params,
            method.body,
            method.generator,
            method.async
          );
          const assignmentExpression = types.assignmentExpression(
            "=",
            left,
            right
          );
          nodes.push(assignmentExpression);
        }
      });
      // 替换节点 一个类节点 -> 多个节点
      nodePath.replaceWithMultiple(nodes);
    },
  },
};

const target = core.transform(sourceCode, {
  plugins: [transformClassPlugin],
});
console.log(target.code);
```

### webpack 的babel插件

#### 按需加载插件

```shell
pnpm install babel-plugin-import -D
```

这里我们引入了lodash，并打印两个方法，也就是只使用了其中的两个方法，我们可以看见打包后的体积：大概474kb。这是一个很恐怖的大小。
明明没使用那么多方法，但是都给我们打包在一起了。

**webpack使用babel的按需加载插件：**

```js
module: {
  rules: [
    {
      test: /\.js$/,
      use: [
        {
          loader: "babel-loader",
          options: {
            // 按需加载插件 且指定按需加载的模块
            plugins: [
              [
                "babel-plugin-import",
                {
                  // 按需加载的模块
                  libraryName: "lodash",
                  // 没有lib目录 从根目录下查找即可
                  libraryDirectory: "",
                },
              ],
            ],
          },
        },
      ],
    },
  ],
},
```

此时打包后的大小也就是在20kb左右了。

#### 按需加载插件的原理

**其实就算没有按需加载插件，只要我们在导入方法的时候，是手动一个个引入的，也会呈现按需导入的效果：**

```js
import flatten from "lodash/flatten";
import concat from "lodash/concat";
console.log(flatten, concat);
```

也就是说，按需加载的插件最后就是会转成这种形式

#### 实现按需导入的插件

这种按需加载的库，都是内部是由一个个小的文件组成的才能实现按需加载。

```js
// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");

module.exports = function () {
  return {
    visitor,
  };
};
const visitor = {
  /**
   * 当babel遍历语法树的时候，当遍历到 ImportDeclaration 导入声明节点时候会执行此函数
   * @param {*} nodePath
   * @param {*} state
   */
  ImportDeclaration(nodePath, state) {
    // 拿到node
    const { node } = nodePath;
    // 获取导入标识符
    const { specifiers } = node;
    // 获取webpack配置文件中配置的参数
    const { libraryName, libraryDirectory = "lib" } = state.opts;
    // 按需加载的 且当前导入不是默认导入
    if (
      node.source.value === libraryName &&
      !types.isImportDefaultSpecifier(specifiers[0])
    ) {
      const declarations = specifiers.map((specifier) => {
        return types.importDeclaration(
          [types.importDefaultSpecifier(specifier.local)],
          types.stringLiteral(
            // `${libraryName}/${libraryDirectory}/${specifier.imported.name}`
            [libraryName, libraryDirectory, specifier.imported.name]
              .filter(Boolean)
              .join("/")
          )
        );
      });
      nodePath.replaceWithMultiple(declarations);
    }
  },
};
```

#### 实现console打印时自动加上行列信息的插件

```js
// 用来生成某些AST节点或者判断某个节点是不是需要某个类型的
const types = require("@babel/types");
const path = require("path");
module.exports = function () {
  return {
    visitor,
  };
};
const visitor = {
  /**
   * 捕获console.log
   * @param {*} nodePath
   * @param {*} state
   */
  CallExpression(nodePath, state) {
    const { node } = nodePath;
    // 成员表达式
    if (types.isMemberExpression(node.callee)) {
      // 是console
      if ((name = node.callee.object.name === "console")) {
        // 方法是 log 等
        if (
          ["log", "debug", "info", "warn", "error"].includes(
            node.callee.property.name
          )
        ) {
          const { line, column } = node.loc.start; // 起始位置信息
          // 获取文件名
          const filename = path
            .relative(path.resolve("."), state.file.opts.filename)
            .replace(/\\/g, "/")
            .replace(/\.\./, "");
          // 在前面添加参数
          node.arguments.unshift(
            types.stringLiteral(`${filename}: ${line}: ${column}`)
          );
        }
      }
    }
  },
};
```

## webpack的编译流程

- 初始化参数，从配置文件和shell语句中读取并合并参数，并得到最终的配置对象
- 用上一步的对象初始Compiler对象
- 加载所有的插件
- 执行`Compiler`对象的`run`方法开始执行编译
- 根据配置文件中有entry配置项找到所有的入口
- 从入口文件触发，调用所有配置的规则，比如loader对模块进行编译
- 再找出此模块的依赖的模块，再递归此步骤找到依赖的模块进行编译
- 等把所有的模块编译完成后，根据模块之间的依赖关系，组成一个包含多个模块的chunk
- 再把各个代码块chunk转换成一个一个的文件加入到输出列表
- 确定好输出内容之后，会根据配置的输出路径和文件名，把文件内容写入到文件系统里

> 在此过程中，webpack会在合适的世界点广播特定的事件，你可以自己写插件监听感兴趣的事件，执行特定的逻辑

编译模块用到的一些库：

```shell
pnpm i @babel/parser @babel/types @babel/traverse @babel/generator -D
```

## 实现 简易的webpack 学习工作流

## loader的学习

- loader 只是一个导出为函数的 JavaScript模块。它接收上一个loader产生的结果或者资源文件（resource file） 作为参数。也可以用多个loader函数组成 loader chain
- compiler需要得到最后一个loader产生的处理结果。这个处理结果应该是string或者buffer（可以转为string）

### 流程

1. 初始化参数，从配置文件和shell中读取合并参数，得出最终参数
2. 开始编译，用上一步得到的参数初始化Compiler对象，加载所有插件，执行该对象的run方法开始编译。确定入口：根据entry找到所有入口文件
3. 编译模块：从入口文件触发，调用所有配置的loader对模块进行编译，再找出该模块的依赖，递归此步骤知道所有的入口依赖文件都经过了本步骤的处理
4. 完成编译：在经过上面步骤使用Loader转译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
5. 输出资源：根据入口和模块之间的依赖关系，组成一个个包含多个模块的chunk，再把每个chunk转换成一个个单独的文件加入到输出列表

### loader-runner

```shell
pnpm install -D loader-runner
```

是一个指向loader链条的模块。可以单独执行一遍loader。
多个loader的执行是从右向左，从下到上的。也就是先执行后面的loader。

#### loader的执行顺序

这里准备8个loader，2个前置，2个行内，2个后置，2个正常的loader。

```js
const { runLoaders } = require("loader-runner");
const path = require("path");
const fs = require("fs");
// enforce属性 是一个配置 用来决定loader的类型的 一般loader都是后面的先执行 这个属性是强制修改执行顺序的可以
// 入口模块文件路径
const entryFile = path.resolve(__dirname, "src/index.js");
// 行内loader的书写方式
const request = `inline1-loader!inline2-loader!${entryFile}`;
const rules = [
  {
    test: /\.js$/,
    use: ["normal1-loader", "normal2-loader"],
  },
  {
    test: /\.js$/,
    enforce: "pre",
    use: ["pre1-loader", "pre2-loader"],
  },
  {
    test: /\.js$/,
    enforce: "post",
    use: ["post1-loader", "post2-loader"],
  },
];
```

enforce属性 是一个配置 用来决定loader的类型的 一般loader都是后面的先执行 这个属性是强制修改执行顺序的可以。
该属性的默认值就是normal。

**如果有多个类型的loader**：
叠加顺序是：post(后置) + inline(行内) + normal(正常) + pre(前置)

```js
const parts = request.split("!");
// 最后一个元素是要加载的模块
const resource = parts.pop();
// 行内loader
const inlineLoaders = [...parts];
// pre/post/normal-loader
const preLoaders = [],
  postLoaders = [],
  normalLoaders = [];
for (let i = 0; i < rules.length; i++) {
  const rule = rules[i];
  if (rule.test.test(resource)) {
    if (!rule.enforce) normalLoaders.push(...rule.use);
    else if (rule.enforce === "pre") preLoaders.push(...rule.use);
    else if (rule.enforce === "post") postLoaders.push(...rule.use);
  }
}
// loaders 合并所有loader 按照顺序
let loaders = [
  ...postLoaders,
  ...inlineLoaders,
  ...normalLoaders,
  ...preLoaders,
];
// 解析loader的绝对路径
const resolveLoader = (loader) => path.resolve(__dirname, "../loaders", loader);
loaders = loaders.map(resolveLoader);
// 执行loader
runLoaders(
  {
    resource, // 要转换的资源文件
    loaders,
    // this指针 该对象会成为loader函数执行时 函数内this的值 所以loader不建议使用箭头函数
    context: { name: "mao" },
    readResource: fs.readFile.bind(this), // 读取资源的方式
  },
  (err, res) => {
    console.log(err);
    console.log("------------------------------------------");
    console.log(res.result.toString()); // 转换后的内容
    console.log("------------------------------------------");
    console.log(res.resourceBuffer.toString()); // 资源文件的原始内容
  }
);
```

可以看见，最后打印的输出结果中，是先打印pre-loader，然后是normal-loader,然后是inline-loader，。最后是post-loader。

### loader特殊配置

webpack提供了几个特殊配置：
如果我们只想要pre-loader，或者只想要post-loader等，都是可以的。
就是通过特殊符号，`-! ,! ,!!`来实现的

- -!: noPreAutoLoaders。不要pre和normal-loader
- !: noAutoLoaders：不要normal-loader
- !!: noPrePostLoaders：不要pre，post，normal-loader。只要inline-loader

```js
const parts = request.replace(/^-?!+/, "").split("!");
// ......
// loaders 合并所有loader 按照顺序
let loaders;
if (request.startsWith("-!")) {
  loaders = [...postLoaders, ...inlineLoaders];
} else if (request.startsWith("!!")) {
  loaders = inlineLoaders;
} else if (request.startsWith("!")) {
  loaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
} else {
  loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}
```

### pitch

前面我们说loader的执行是从右向左的。但是实际上在执行过程中，也会从左到右执行一遍，然后才从右到左。
从左到右先执行的，就是loader的pitch。
**什么是pitch：？**
比如：行内级的loader：`a!b!c!xxx.js`,执行顺序肯定是c，b，a。但是真正的执行顺序其实是 a (pitch),b(pitch),c(pitch)。abc 中任何一个pitching loader返回了值，就相当于在它以及它右边的loader已经执行完毕

- 如果b pitch 返回了字符串 "hello",接下来只有a loader会被执行，且a的参数是b pitch的返回值。
- loader的根据返回值分为两种，一种是直接返回js字符串代码（一个含有module发代码，有类似module.exports语句）的loader，还有不能作为最左边loader的其他loader
- 有时候我们想把两个第一种loader chain起来，比如style-loader，css-loader、问题是css-loader的返回值是一串js代码，如果按正常方式写style-loader的参数就是一串代码字符串
- 为了解决这种问题，我们需要在style-loader里执行`require("css-loader!resource")`

正如上面的我们的8个loader，如果都有pitch方法：

```js
function loader(source) {
  console.log("inline1  ......");
  return source + "//inline1 loader";
}
// 配置pitch
loader.pitch = function () {
  console.log("inline 1 pitch !!!");
};
module.exports = loader;
```

可以看见打印效果：

```txt
post1 pitch !!!
post2 pitch !!!
inline 1 pitch !!!
inline 2 pitch !!!
normal1 pitch !!!
normal2 pitch !!!
pre1 pitch !!!
pre2 pitch !!!
pre2  ......
pre1  ......
normal2  ......
normal1  ......
inline2  ......
inline1  ......
post2  ......
post1  ......
null
------------------------------------------
console.log("hello index");
//pre2 loader//pre1 loader//normal2 loader//normal1 loader//inline2 loader//inline1 loader//post2 loader//post1 loader
------------------------------------------
console.log("hello index");
```

很明显是先都执行了一遍从左到右的loader.pitch方法。
如果pitch方法没有返回值，那就继续执行下一个loader，如果pitch方法有返回值，就直接结束。执行loader的时候，也只会从当前结束这个loader.pitch开始的上一个loader开始执行。且将当前pitch的返回值作为上一个loader的参数。(注意，当前pitch有返回值的loader也不会执行了)
比如：我们在inline2-loader的pitch方法进行返回：

```js
function loader(source) {
  console.log("inline2  ......");
  return source + "//inline2 loader";
}
// 配置pitch
loader.pitch = function () {
  console.log("inline 2 pitch !!!");
  return "inline 2 return !!!"
};
module.exports = loader;
```

结果：

```txt
post1 pitch !!!
post2 pitch !!!
inline 1 pitch !!!
inline 2 pitch !!!
inline1  ......
post2  ......
post1  ......
```

#### 异步loader

当然，只要你想，loader也可以是异步的：比如

```js
function loader(source) {
  console.log("post2  ......");
  // 让loader的执行变成异步
  // 调用this.async() 可以吧loader的执行由同步变成异步了
  // return source + "//post2 loader";
  const callback = this.async();
  setTimeout(() => {
    callback(null, source + "//post2 loader");
  }, 3000);
}
loader.pitch = function () {
  console.log("post2 pitch !!!");
};
module.exports = loader;
```

### babel-loader的学习

使用自定义loader的方式：

1. 直接用loader的绝对路径
2. 可以通过resolveLoader属性，配置在下面想使用的loader的别名，以及loader的绝对路径

    ```js
    module.exports = {
      resolveLoader:{
        alias: {
          "test-loader": path.resolve(__dirname, "xxx")
        },
      },
      module:{
          rules: [
            {
              test:/\.js/,
              use: {
                loader: "test-loader"
              }
            }
          ]
        }
    }
    ```

3. 可以通过`resolveLoader.modules`属性配置查找的模块所在的文件夹目录等

    ```js
    module.exports = {
      resolveLoader:{
        alias: {
          "test-loader": path.resolve(__dirname, "xxx")
        },
        modules: [path.resolve("xxx module"), "node_modules"]
      },
      module:{
          rules: [
            {
              test:/\.js/,
              use: {
                loader: "test-loader"
              }
            }
          ]
        }
    }
    ```

#### babel-loader 的作用

babel-loader 只是提供一个转换函数，但是它并不知道要干啥，要转啥。
`@babel/core`核心包负责把源代码转成AST，然后遍历AST，然后重新生成新的代码！
但是它并不知道如何转换语法树，比如它不认识箭头函数，不知道如何转为函数声明的形式，也就是说如何转换它并不知道，但是它会提供一些访问AST的接口，也就是访问器模式了。我们可以使用`@babel/transform-arrow-functions`插件，该插件就是访问器，它知道如何转换AST语法树。因为要转换的语法太多，导致插件也太多（单一职责），所以可以把一堆插件打包在一起，成为预设`preset-env`,就是插件的集合。

**babel-loader**：

```js
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
  console.log(map);
  // 通过callback的形式 可以传递多个参数给下一个loader 也是同步的
  this.callback(null, code, map, ast);
  // return source;
}

module.exports = babelLoader;
```

当然，如果在webpack配置文件中，配置了`devtool: "source-map"`.生成的map文件是最全的。

### style-loader学习

- css-loader的作用是处理css中的`@import`和`url`这样的外部资源
- `style-loader`的作用是把样式插入到DOM中，方法是在`head`中插入一个`style`标签，并把样式写入到这个标签的`innerHTML`里面
- less-loader 可以把less编译为css
- pitching-loader
- loader-utils（webpack5可以使用this.getOptions获取loader的选项）
- !!

#### style-loader和less-loader的基本原理

webpack配置：

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = {
  // ...
  devtool: "source-map",
  resolveLoader: {
    alias: {
      "babel-loader": path.resolve(__dirname, "./loader/babel-loader.js"),
      "less-loader": path.resolve(__dirname, "./loader/less-loader.js"),
      "style-loader": path.resolve(__dirname, "./loader/style-loader.js"),
    },
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          { loader: "style-loader" },
          { loader: "less-loader" },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
```

**less-loader**的原理：

```js
const less = require("less");
function lessLoader(lessContent) {
  // console.log(this.resource, this.resourcePath); // 一样的
  // 1. 同步转为异步loader  2. 返回一个callback 调用callback向下一个loader传递参数
  const callback = this.async();
  less.render(lessContent, { filename: this.resource }, (err, output) => {
    // less转为css交给下一个loader
    callback(err, output.css);
  });
}
module.exports = lessLoader;
```

**style-loader**的原理：

```js
function styleLoader(cssContent) {
  const script = `
    const style = document.createElement("style");
    style.innerHTML = ${JSON.stringify(cssContent)};
    document.head.append(style);
  `;
  return script;
}

module.exports = styleLoader;
```

#### loader返回脚本

对于多个loader组成的loader chain，其执行的最左侧loader（最后执行的loader）必须返回一个脚本，因为webpack只认识脚本。
但是对于前面的loader，其返回值可以是任意的，因为后面还有其他loader会对我们的产物进行处理，转为脚本或者对产物进一步处理。

比如我们前面的`less-loader`我们就可以这样更改：返回值变成了一个模块导出内容的字符串脚本形式了。

```js
const less = require("less");
function lessLoader(lessContent) {
  // 1. 同步转为异步loader  2. 返回一个callback 调用callback向下一个loader传递参数
  const callback = this.async();
  // console.log(this.resource, this.resourcePath); // 一样的
  // 看似异步  实际上 less.render的执行是同步的，包括回调也是同步执行
  // 如果不想用异步loader 其实用一个变量在回调中接收返回值，在下面直接return 也是可以的
  // let css;
  less.render(lessContent, { filename: this.resource }, (err, output) => {
    // less转为css交给下一个loader
    // console.log(output);
    // callback(err, output.css);
    // css = `module.exports = ${JSON.stringify(output.css)}`
    // 直接返回一个 脚本字符串 （可以认为是模块导出了）
    callback(err, `module.exports = ${JSON.stringify(output.css)}`);
  });
  // return css;
}

module.exports = lessLoader;
```

**那么对于style-loader**，也需要再次修改：

```js
// const { stringifyRequest } = require("loader-utils");
const path = require("path");
function styleLoader(cssContent) {}
/**
 * @param {*} remainingRequest 剩下的 request 还没执行的loader
 */
styleLoader.pitch = function (remainingRequest) {
  // F:\vscode\webFile\webpack\learn-webpack\loader\less-loader.js!F:\vscode\webFile\webpack\learn-webpack\src\index.less
  console.log(remainingRequest);
  // "!!../loader/less-loader.js!./index.less"
  console.log(stringifyRequest(this, "!!" + remainingRequest));
  // style-loader less-loader index.less
  // 剩下没执行的 就是 less-loader!index.less
  // webpack会再次解析这个模块index.less，而且因为 !! 只会走行内loader了
  // 相当于走了两次loader的流程：第一次走到style.pitch这个环节就结束了，第二次只走less-loader了
  const script = `
    const style = document.createElement("style");
    style.innerHTML = require(${stringifyRequest(
      this,
      "!!" + remainingRequest
    )});
    document.head.append(style);
  `;
  return script;
};
function stringifyRequest(loaderContext, request) {
  const splitted = request.replace(/^-?!+/, "").split("!");
  // 项目根路径
  const { context } = loaderContext;
  return JSON.stringify(
    "!!" +
      splitted
        .map((part) => {
          part = path.relative(context, part);
          if (part[0] !== ".") part = "./" + part;
          return part.replace(/\\/g, "/");
        })
        .join("!")
  );
}
module.exports = styleLoader;
```

其实分析一下打包产物，也可以看出来，第一遍加载index.less的时候，并没有真正的数据，其内部还需要再次加载一次通过less-loader处理后的产物。

```js
var modules = {
  "./src/title.js": (module, exports) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true,
    });
    exports.name = void 0;
    var name = "zs";
    exports.name = name;
  },
  "./loader/less-loader.js!./src/index.less": (module) => {
    module.exports =
      "body {\n  background-color: #bfc;\n}\n.root {\n  background-color: aqua;\n  width: 200px;\n  height: 200px;\n  color: #bfc;\n}\n";
  },
  "./src/index.less": (module, __unused_webpack_exports, require) => {
    const style = document.createElement("style");
    style.innerHTML = require("./loader/less-loader.js!./src/index.less");
    document.head.append(style);
  },
};
```

## loader-runner库的原理

```js
const fs = require("fs");
/**
 * runner -> runLoaders -> iteratorPitchLoaders -> processResource -> iteratorNormalLoaders -> pitchCallback -> finalCallback
 * @param {*} options 配置选项
 * @param {*} finalCallback 最终回调
 */
function runLoaders(options, finalCallback) {
  const {
    resource, // 资源文件
    loaders = [], // 此文件需要用到的loader
    context = {}, // 上下文对象
    readResource = fs.readFile, // 读取文件的方法
  } = options;
  const loaderObjects = loaders.map(createLoaderObject);
  const loaderContext = context; // loader中normal或者pitch函数执行时候的this对象
  loaderContext.resource = resource;
  loaderContext.loaders = loaderObjects;
  loaderContext.readResource = readResource;
  loaderContext.loaderIndex = 0; // 当前正在执行的loader的索引
  loaderContext.callback = null; // 回调阿汉 它的作用是调用以后就会执行下一步的loader
  loaderContext.async = null; // 默认loader的执行是同步的 执行loader的代码以后 执行下一个loader的代码 调用该函数 同步变为异步了
  // 定义一些getter
  defineLoaderContextGetters(loaderContext);
  const processOptions = {
    resourceBuffer: null, // 要处理的资源文件的Buffer index.js对应的buffer
    readResource,
  };
  // 开始迭代执行每个loader的pitch函数
  iteratePitchLoader(processOptions, loaderContext, (err, result) => {
    finalCallback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}
/**
 * 迭代执行pitch函数
 * @param {*} processOptions
 * @param {*} loaderContext
 * @param {*} pitchCallback
 */
function iteratePitchLoader(processOptions, loaderContext, pitchCallback) {
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    // loader处理完毕 加载资源
    return processResource(processOptions, loaderContext, pitchCallback);
  }
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  // pitch已经执行过了
  if (currentLoader.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchLoader(processOptions, loaderContext, pitchCallback);
  }
  const pitch = currentLoader.pitch;
  currentLoader.pitchExecuted = true; // pitch已经执行过了
  // 当前loader没有pitch 进入下一个loader
  if (!typeof pitch === "function") {
    return iteratePitchLoader(processOptions, loaderContext, pitchCallback);
  }
  // 以同步或者异步的方式 执行pitch
  runSyncOrAsync(
    pitch,
    loaderContext,
    [
      loaderContext.remainingRequest,
      loaderContext.previousRequest,
      loaderContext.data,
    ],
    (err, ...args) => {
      // 执行下一个loader
      // 如果pitch的返回值不为空 则跳过后续的loader和读文件操作 直接掉头执行前一个loader的normal
      if (args.length > 0 && args.some((item) => !!item)) {
        loaderContext.loaderIndex--;
        return iterateNormalLoader(
          processOptions,
          loaderContext,
          args,
          pitchCallback
        );
      } else {
        return iteratePitchLoader(processOptions, loaderContext, pitchCallback);
      }
    }
  );
}
/**
 * 读取资源文件并处理 然后开始执行loader的normal函数了
 * @param {*} processOptions
 * @param {*} loaderContext
 * @param {*} pitchCallback
 */
function processResource(processOptions, loaderContext, pitchCallback) {
  processOptions.readResource(loaderContext.resource, (err, resourceBuffer) => {
    processOptions.resourceBuffer = resourceBuffer;
    loaderContext.loaderIndex--;
    iterateNormalLoader(
      processOptions,
      loaderContext,
      [resourceBuffer],
      pitchCallback
    );
  });
}
/**
 *
 * @param {*} processOptions
 * @param {*} loaderContext
 * @param {Array} args 可能是pitch的返回值 也可能是loader的normal返回值 或者是最顶级的webpack加载的资源传递给loader
 * @param {*} pitchingCallback
 */
function iterateNormalLoader(
  processOptions,
  loaderContext,
  args,
  pitchingCallback
) {
  // loader执行完毕
  if (loaderContext.loaderIndex < 0) {
    return pitchingCallback(null, ...args);
  }
  const currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoader(
      processOptions,
      loaderContext,
      args,
      pitchingCallback
    );
  }
  const normalFn = currentLoader.normal;
  currentLoader.normalExecuted = true;
  convertArgs(args, currentLoader.raw);
  runSyncOrAsync(normalFn, loaderContext, args, (err, ...res) => {
    return iterateNormalLoader(
      processOptions,
      loaderContext,
      [res],
      pitchingCallback
    );
  });
}
/**
 * 根据参数转换buffer和string
 * @param {Array} args
 * @param {boolean} raw true 表示需要buffer
 */
function convertArgs(args, raw) {
  const isBuffer = Buffer.isBuffer(args[0]);
  if (raw && !isBuffer) {
    args[0] = Buffer.from(args[0]);
  } else if (!raw && isBuffer) {
    args[0] = args[0].toString();
  }
}
/**
 *
 * @param {Function} fn pitch 需要处理pitch的同步异步
 * @param {*} loaderContext
 * @param {*} args
 * @param {Function} runCallback
 */
function runSyncOrAsync(fn, loaderContext, args, runCallback) {
  // 默认同步执行
  let isSync = true;
  // 在loader的函数里执行该函数 相当于执行下一个loader对应的函数
  loaderContext.callback = (...args) => {
    runCallback(...args);
  };
  loaderContext.async = function () {
    // 把同步执行的标识标记为异步
    isSync = false;
    return loaderContext.callback;
  };
  // pitch返回结果 如果是loader的normal函数调用了async方法，就会变成异步了 当然pitch方法也可以异步的
  const result = fn.apply(loaderContext, args);
  // 如果是同步loader pitch
  if (isSync) {
    // 直接调用runCallback向下执行 如果是异步 不执行任何代码 等待在loader里调用callback
    runCallback(null, result);
  }
}
/**
 * 把loader的觉得对路径变成一个函数
 * @param {*} loader
 * @returns
 */
function createLoaderObject(loader) {
  // 获取loader的normal函数（导出的函数）
  const normal = require(loader);
  // 获取pitch方法
  const pitch = normal.pitch;
  // 获取 raw 如果为true 我们传递给loader的源内容是一个Buffer，否则就是一个字符串
  const raw = normal.raw;
  return {
    path: loader,
    normal,
    pitch,
    raw, // 为true的时候 内容是buffer 也就是二进制了
    data: {}, // 每个loader可以携带一个自定义的数据对象
    pitchExecuted: false, // pitch方法是否执行过
    normalExecuted: false, // normal（loader函数本身）是否执行过
  };
}

function defineLoaderContextGetters(loaderContext) {
  // 代表本次请求
  Object.defineProperty(loaderContext, "request", {
    get() {
      // loader1!loader2!index.js
      return loaderContext.loaders
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
    set() {},
  });
  // 剩下的请求
  Object.defineProperty(loaderContext, "remainingRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  // 当前的loader和剩余的loader请求
  Object.defineProperty(loaderContext, "currentRequest", {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  // 之前的请求（处理过的）
  Object.defineProperty(loaderContext, "previousRequest", {
    get() {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .concat(loaderContext.resource)
        .join("!");
    },
  });
  // data 当前loader的data
  Object.defineProperty(loaderContext, "data", {
    get() {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });
}
module.exports = runLoaders;
```

## webpack 插件机制

- 在具体介绍webpack内置插件与钩子可视化工具之前，我们先来了解一下webpack中的插件机制。webpack实现插件的大体方式是：
  - 创建：`webpack` 在其内部对象上创建各种钩子
  - 注册：插件将自己的方法注册到对应的钩子上，交给`webpack`
  - 调用：`webpack`编译过程中，会适时地触发相应钩子，因此也就触发了插件的方法。
- webpack本质上是一种事件流机制，它的工作流程就是将各个插件串联起来，而实现这一切核心就是`tapable`，webpack中最核心的负责编译的`Compiler`和负责创建`bundle`的`Compilation`都是`tapable`的实例
- 通过事件的注册和监听，触发`webpack`生命周期函数中的函数方法

**tapable常用的**一般有9个钩子：
Hook钩子类型可以分类同步和异步两种，异步又有并行和串行。

```js
const {
  SyncHook,
  SyncBailHook, // 同步有保险的钩子
  SyncWaterfallHook, // 瀑布钩子
  SyncLoopHook, // 循环钩子
  AsyncParallelHook, // 并行异步钩子
  AsyncParallelBailHook, // 并行保险异步钩子
  AsyncSeriesHook, // 串行异步钩子
  AsyncSeriesBailHook, // 串行保险异步
  AsyncSeriesWaterfallHook, // 串行保险瀑布钩子
  AsyncSeriesLoopHook,// 串行循环钩子
} = require("tapable");
```

如果按照hook的返回值来分类，可以分为四种：

1. `bail`：保险钩子，一个失败，则全失败。遇到第一个结果是 `result !== undefined` 则返回，不再继续执行下去。有`SyncBailHook，AsyncSeriesBailHook， AsyncParallelBailHook`。也就是不能有返回值，有返回值就停止执行了。这就跟谈对象一样，你谈对象可能有多个，但是当你结婚以后肯定不会再找一个新对象了。
2. `loop`：循环钩子。会不停的执行所有的事件函数，直到所有的结果都是`undefined`。有`SyncLoopHook， AsyncSeriesLoopHook`。只要有一个事件函数的返回值不是`undefined`，就又回到第一个事件函数开始重新执行。
3. `basic`：基础钩子，顺序依次执行，不关心返回值。
4. `waterfall`：瀑布钩子，上一个钩子的执行结果是下一个的参数。只要上一个事件函数的返回值不是`undefined`，就会把返回值作为下一个事件函数的参数，有`SyncWaterfallHook, AsyncSeriesWaterfallHook`.如果第一个事件函数有返回值，但是第二个没有返回值，那么执行第三个事件函数的时候，第一个参数其实也是第一个事件函数的返回值的。

### 几个钩子的使用

#### SyncHook

SyncHook是一个类 创建一个同步钩子的实例。可以传递一个数组，数组元素的个数表示将来传给事件函数的参数个数。通过tap方法注册钩子，call方法触发钩子的执行，当然可以给call方法传递参数，但是只会传递给事件函数在创建实例预先定义好的参数个数。

```js
const {
  SyncHook,
} = require("tapable");

// SyncHook是一个类 创建一个同步钩子的实例
const hook = new SyncHook(["name", "age"]);
// 注册钩子
hook.tap("1", (name, age) => {
  console.log("-----------------", 1, name, age);
});
hook.tap("2", (name, age) => {
  console.log("-----------------", 2, name, age);
});
// 触发钩子
hook.call("zs", 22);
```

#### SyncBailHook

使用方式和SyncHook完全一样。但是如果某个事件函数有返回值，则下面的钩子不在继续执行。

```js
const hook = new SyncBailHook(["name", "age"]);
// 注册钩子
hook.tap("1", (name, age) => {
  console.log("-----------------", 1, name, age);
});
hook.tap("2", (name, age) => {
  console.log("-----------------", 2, name, age);
  // 有返回值 不在继续向下执行其他事件函数了
  return "2";
});
hook.tap("3", (name, age) => {
  console.log("-----------------", 3, name, age);
});
// 触发钩子
hook.call("zs", 22);
```

#### SyncWaterfallHook

还是和上面说的一样，使用方式是不变的。但是前一个事件函数有返回值，那就会类似于修改了传给call方法的参数，每次有返回值，都会覆盖掉第一个参数。

```js
const hook = new SyncWaterfallHook(["name", "age"]);
// 注册钩子
hook.tap("1", (name, age) => {
  console.log("-----------------", 1, name, age);
  // 当前钩子的返回值 会成为下一个事件函数参数的第一个
  return "1->ls";
});
hook.tap("2", (name, age) => {
  console.log("-----------------", 2, name, age);
  // 有返回值下一个事件函数参数的第一个就是当前返回值 没有就还是上一个事件函数的返回值
  return "2->ww";
});
hook.tap("3", (name, age) => {
  console.log("-----------------", 3, name, age);
});
// 触发钩子
hook.call("zs", 22);
```

#### SyncLoopHook

该钩子如果某一个事件函数的返回值不是`undefined`，则会从头开始执行。
可以猜测一下，下面的每个事件函数到底执行了几次？最后的打印次数是多少呢？

```js
const hook = new SyncLoopHook();
let count1 = (count2 = count3 = 0);
let sum = 0;
// 注册钩子
hook.tap("1", () => {
  sum++;
  console.log("1-----------------count1", count1);
  if (++count1 === 1) {
    count1 = 0;
    // 返回undefined 继续执行下一个事件函数
    return;
  }
  // 不是undefined 重新开始执行第一个事件函数
  return true;
});
hook.tap("2", () => {
  sum++;
  console.log("2-----------------count2", count2);
  if (++count2 === 2) {
    count2 = 0;
    return;
  }
  return true;
});
hook.tap("3", () => {
  sum++;
  console.log("3-----------------count3", count3);
  if (++count3 === 3) {
    count3 = 0;
    return;
  }
  return true;
});
// 触发钩子
hook.call();
console.log("sum ->", sum); // ?
```

#### AsyncParallelHook

我们使用该钩子一样可以进行同步注册，但是触发执行都是通过callAsync方法了。

```js
const hook = new AsyncParallelHook(["name", "age"]);
// 同步注册
hook.tap("1", (name, age) => {
  console.log("1-----------------", name, age);
});
hook.tap("2", (name, age) => {
  console.log("2-----------------", name, age);
});
hook.tap("3", (name, age) => {
  console.log("3-----------------", name, age);
});
// 触发钩子 callAsync
hook.callAsync("zs", 22, (err) => {
  // 有错误 会执行该回调函数
  console.log(err);
});
```

异步注册钩子的方式：异步注册的钩子会同时执行，多个事件函数之间不会相互干扰，并行执行。传统的异步方式是采用回调函数的形式，如下例就是：

```js
console.time("start");
// 异步注册
hook.tapAsync("1", (name, age, callback) => {
  setTimeout(() => {
    console.log("1-----------------", name, age);
    // callback参数是一个函数 调用该函数表示回调执行结束了
    callback();
  }, 1000);
});
hook.tapAsync("2", (name, age, callback) => {
  setTimeout(() => {
    console.log("2-----------------", name, age);
    callback();
  }, 2000);
});
hook.tapAsync("3", (name, age, callback) => {
  setTimeout(() => {
    console.log("3-----------------", name, age);
    callback();
    console.timeEnd("start"); // start: 3.013s
  }, 3000);
});
// 触发钩子 callAsync
hook.callAsync("zs", 22, (err) => {
  // 有错误 会执行该回调函数
  console.log("error->", err);
});
```

当然执行异步的方式，我们也可以采用Promise的形式：使用tapPromise方法注册的事件函数的返回值是一个promise即可。当然，我们触发钩子的时候在上面使用的是callAsync方法，该方法也是以回调函数的形式来看其是否有错误产生，当然我们可以使用promise方法，这样就可以采用promise的链式调用的形式拿到最终的结果，看是否有错误产生。

```js
console.time("promise");
// 异步注册 promise
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      resolve();
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      resolve();
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise"); // promise: 3.006s
    }, 3000);
  });
});
hook.promise("zs", 22).then((res) => {
  // 有错误 会执行该回调函数
  console.log("res->", res);
});
```

#### AsyncParallelBailHook

只要有一个事件处理函数有返回值（相当于给回调函数传参，或者promise的resolve有接收值），那么整个钩子的promise就会成功或者失败。当然其他的事件函数因为是并行执行，所以异步的事件函数依然会执行。

```js
const hook = new AsyncParallelBailHook(["name", "age"]);
console.time("promise");
// 异步注册 promise
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      // 只要有一个resolve有了返回值，触发函数的返回的promise就直接成功了
      resolve("1---");
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      resolve();
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise"); // promise: 3.006s
    }, 3000);
  });
});
hook.promise("zs", 22).then((res) => {
  console.log("res->", res);
});
```

#### AsyncSeriesHook

常规串行执行，上一个事件函数处理完以后才会处理下一个事件函数。

```js
const hook = new AsyncSeriesHook(["name", "age"]);

console.time("promise");
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      resolve();
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      resolve();
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise"); // promise: 6.032s
    }, 3000);
  });
});
// 触发钩子 callAsync
hook.promise("zs", 22).then((res) => {
  // 有错误 会执行该回调函数
  console.log("res->", res);
});
```

#### AsyncSeriesBailHook

用法还是没什么大的区别，只是对于串行的保险钩子，上一个事件函数有返回值的情况，后面的事件函数就不会执行了。且Promise也是直接拿到resolve结果了。

```js
const hook = new AsyncSeriesBailHook(["name", "age"]);

console.time("promise");
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      resolve();
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      resolve("2---");
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise"); // 上一个事件函数有返回值了 不会执行到这里
    }, 3000);
  });
});
// 触发钩子 callAsync
hook.promise("zs", 22).then((res) => {
  // 有错误 会执行该回调函数
  console.log("res->", res);
});
```

#### AsyncSeriesWaterfallHook

效果和前面同步的waterfall基本是一样的，但是要注意这里的下一个事件函数是不确定的，谁先执行谁就是下一个事件函数，因为是异步注册的事件函数，就看谁先执行了。

```js
const hook = new AsyncSeriesWaterfallHook(["name", "age"]);
console.time("promise");
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("1-----------------", name, age);
      // 返回值作为下一个执行的事件函数的第一个参数 效果和前面的同步钩子差不多
      resolve("1---");
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("2-----------------", name, age);
      // 有返回值 那么就会覆盖掉上一个执行的事件函数的返回值 没有的时候 当前事件函数的下一个要执行的事件函数的参数还是上一次的事件函数返回值
      // resolve("2---");
      resolve();
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("3-----------------", name, age);
      resolve();
      console.timeEnd("promise");
    }, 3000);
  });
});
hook.promise("zs", 22).then((res) => {
  // 有错误 会执行该回调函数
  console.log("res->", res);
});
```

#### AsyncSeriesLoopHook

异步的循环串行钩子其实和同步的循环钩子基本都是一致的，区别还是在于谁先执行，谁就是下一个事件函数，而不是按照注册顺序确定的。

```js
const hook = new AsyncSeriesLoopHook(["name", "age"]);

let count1 = (count2 = count3 = 0);
let sum = 0;
hook.tapPromise("1", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      sum++;
      console.log("1-----------------", name, age, count1);
      if (++count1 === 1) {
        count1 = 0;
        resolve();
      }
      resolve("1---");
    }, 1000);
  });
});
hook.tapPromise("2", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      sum++;
      console.log("2-----------------", name, age, count2);
      if (++count2 === 2) {
        count2 = 0;
        resolve();
      }
      resolve("2---");
    }, 2000);
  });
});
hook.tapPromise("3", (name, age) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      sum++;
      console.log("3-----------------", name, age, count3);
      if (++count3 === 3) {
        count3 = 0;
        resolve();
      }
      resolve("3---");
    }, 3000);
  });
});
hook.promise("zs", 22).then((res) => {
  console.log("res->", res, "sum->", sum);
});

```

### 钩子的实现原理

首先每个钩子都是一个类，用来创建钩子对象。可以接收一个参数，参数是数组，数组元素的个数就是将来可以传递给事件函数的参数个数。
且再tapable内部，对于执行事件处理函数，可以认为是动态创建函数然后取出所有的事件函数执行的。比如：

```js
function sum(a,b){
  return a+b;
}
// 动态创建
const sum = new Function("a,b","return a+b")
// 最后我们创建的函数可能是这种
function anonymous(name,age
) {

    // header
    var _x = this._x;

    var _fn0 = _x[0];
    _fn0(name,age);

    var _fn1 = _x[1];
    _fn1(name,age);

}
```

也就是说，对于我们触发所有事件函数执行的那个call方法，实际上是触发时刻动态创建出来的。

#### SyncHook的实现

说了这么多，这个call函数是如何拼起来创建的？其实对于源码还是有点绕的。至于为什么要动态创建，主要是为了懒执行，以及不同的钩子实现方式会不一样，所以我们在基类钩子Hook里面是不能绝对call实际的执行方式的。因此，就采用了子类实现的方式，具体的创建方式交给子类，实际调用是父类完成。

**Hook.js**:

```js
class Hook {
  /**
   *
   * @param {Array} args
   */
  constructor(args = []) {
    /**
     * 事件函数形参列表
     * @type {Array<string>}
     */
    this.args = args;
    /**
     * 存放事件函数
     * @type {Array<{name:string,fn:Function,type:"sync"|"async"}>}
     */
    this.taps = [];
    //  假的call方法 占位
    this.call = CALL_DELEGATE;
    // 将会存放要执行的事件处理函数
    this._x = null;
  }
  /**
   *
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  tap(options, fn) {
    this.#_tap("sync", options, fn);
  }
  /**
   * @param {"sync"|"async"} type 调用类型
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  #_tap(type, options, fn) {
    if (typeof options === "string") {
      options = { name: options };
    }
    // 两个属性 name fn
    const tapInfo = { ...options, fn, type };
    this.#insert(tapInfo);
  }
  /**
   * 注册一个事件函数
   * @param {{name:string,fn:Function,type:"sync"|"async"}} tapInfo
   */
  #insert(tapInfo) {
    this.taps.push(tapInfo);
  }
  /**
   * 触发事件函数的执行 事件函数的动态编译的
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param  {...any} args
   */
  // #call(options, ...args) {}
  /**
   *
   * @param {"sync"|"async"} type
   */
  _createCall(type) {
    // 执行编译 生成 call方法 交给子类实现的
    return this.compile({
      taps: this.taps,
      args: this.args,
      type,
    });
  }
}
const CALL_DELEGATE = function (...args) {
  // 生成 call方法
  this.call = this._createCall("sync");
  // 执行
  return this.call(...args);
};

module.exports = Hook;
```

**SyncHook**:

```js
const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

class SyncHookCodeFactory extends HookCodeFactory {
  content() {
    // 调用父类的串行方法 执行taps
    return this.callTapsSeries();
  }
}
const factory = new SyncHookCodeFactory();
class SyncHook extends Hook {
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}
module.exports = SyncHook;
```

**HookCodeFactory**:

```js
const Hook = require("./Hook");
/**
 * 创建代码函数工厂
 */
class HookCodeFactory {
  /**
   *
   * @param {Hook} hookInstance
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  setup(hookInstance, options) {
    // 取出所有的事件处理函数 存放到 hook实例的 _x属性上
    hookInstance._x = options.taps.map((tapInfo) => tapInfo.fn);
  }
  /**
   *
   * @returns {string} 拼形参数组
   */
  #args() {
    const { args } = this.options;
    return args.join(",");
  }
  #header() {
    return `
    // header
    var _x = this._x;\n`;
  }
  callTapsSeries() {
    const taps = this.options.taps;
    let code = "";
    for (let i = 0; i < taps.length; i++) {
      const tapContent = this.#callTap(i);
      code += tapContent;
    }
    return code;
  }
  #callTap(tapIndex) {
    const tapInfo = this.options.taps[tapIndex];
    let code = `
    var _fn${tapIndex} = _x[${tapIndex}];
    `;
    switch (tapInfo.type) {
      case "sync":
        code += `_fn${tapIndex}(${this.#args()});\n`;
        break;
    }
    return code;
  }
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  #init(options) {
    this.options = options;
  }
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  create(options) {
    // 初始化创建
    this.#init(options);
    let fn;
    switch (this.options.type) {
      case "sync":
        // content方法 也就是具体的事件函数调用 会由子类实现
        fn = new Function(this.#args(), this.#header() + this.content());
        break;
      case "async":
        break;
      default:
        break;
    }
    // 销毁
    this.#deInit();
    return fn;
  }
  #deInit() {
    this.options = null;
  }
}
module.exports = HookCodeFactory;
```

实现方式就需要这三个核心文件，最后的效果和原生SyncHook一致。

#### AsyncParallelHook实现原理

其实异步的实现，有点类似于promise.all方法，所有的事件函数都处理完毕，那就调用最终的回调函数。
我们注册事件函数，可以使用同步方式`tap,call`，也可以使用回调异步的方式`tapAsync, callAsync`，也可以使用`tapPromise , promise`的形式。我们也可以实现一下其核心原理，最后的效果也是可以的。

这里就直接上干货了，不多哔哔废话，对于注释写的也是很清晰的。
**Hook.js**:

```js
class Hook {
  /**
   *
   * @param {Array} args
   */
  constructor(args = []) {
    /**
     * 事件函数形参列表
     * @type {Array<string>}
     */
    this.args = args;
    /**
     * 存放事件函数
     * @type {Array<{name:string,fn:Function,type:"sync"|"async"}>}
     */
    this.taps = [];
    //  假的call方法 占位
    this.call = CALL_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    this.promise = PROMISE_DELEGATE;
    // 将会存放要执行的事件处理函数
    this._x = null;
  }
  /**
   *
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  tap(options, fn) {
    this.#_tap("sync", options, fn);
  }
  tapAsync(options, fn) {
    this.#_tap("async", options, fn);
  }
  tapPromise(options, fn) {
    this.#_tap("promise", options, fn);
  }
  /**
   * @param {"sync"|"async"} type 调用类型
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  #_tap(type, options, fn) {
    if (typeof options === "string") {
      options = { name: options };
    }
    // 两个属性 name fn
    const tapInfo = { ...options, fn, type };
    this.#insert(tapInfo);
  }
  /**
   * 注册一个事件函数
   * @param {{name:string,fn:Function,type:"sync"|"async"}} tapInfo
   */
  #insert(tapInfo) {
    this.taps.push(tapInfo);
  }
  /**
   * 触发事件函数的执行 事件函数的动态编译的
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param  {...any} args
   */
  // #call(options, ...args) {}
  /**
   *
   * @param {"sync"|"async"} type
   */
  _createCall(type) {
    // 执行编译 生成 call方法 交给子类实现的
    return this.compile({
      taps: this.taps,
      args: this.args,
      type,
    });
  }
}
// 同步代理
const CALL_DELEGATE = function (...args) {
  // 生成 call方法
  this.call = this._createCall("sync");
  // 执行
  return this.call(...args);
};
// 异步代理
const CALL_ASYNC_DELEGATE = function (...args) {
  // 生成 call方法
  this.callAsync = this._createCall("async");
  // 执行
  return this.callAsync(...args);
};
// promise
const PROMISE_DELEGATE = function (...args) {
  // 生成 call方法
  this.promise = this._createCall("promise");
  // 执行
  return this.promise(...args);
};

module.exports = Hook;
```

**HookCodeFactory.js**:

```js
const Hook = require("./Hook");
/**
 * 创建代码函数工厂
 */
class HookCodeFactory {
  /**
   *
   * @param {Hook} hookInstance
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  setup(hookInstance, options) {
    // 取出所有的事件处理函数 存放到 hook实例的 _x属性上
    hookInstance._x = options.taps.map((tapInfo) => tapInfo.fn);
  }
  /**
   *
   * @returns {string} 拼形参数组
   */
  #args({ after } = {}) {
    const { args } = this.options;
    const allArgs = args.slice(0);
    if (after) {
      allArgs.push(after);
    }
    return allArgs.join(", ");
  }
  #header() {
    return `
    // header
    var _x = this._x;\n`;
  }
  /**
   * 串行
   * @returns
   */
  callTapsSeries() {
    const taps = this.options.taps;
    let code = "";
    for (let i = 0; i < taps.length; i++) {
      const tapContent = this.#callTap(i);
      code += tapContent;
    }
    return code;
  }
  /**
   * 并行的执行taps
   */
  callTapsParallel({ onDone } = { onDone: () => "_callback();" }) {
    const taps = this.options.taps;
    let code = `var _counter = ${taps.length};`;
    code += `
    var _done = (function (){
      // _callback();
      ${onDone()}
    });
    `;
    for (let i = 0; i < taps.length; i++) {
      const tapContent = this.#callTap(i);
      code += tapContent;
    }
    return code;
  }
  #callTap(tapIndex) {
    const tapInfo = this.options.taps[tapIndex];
    let code = `
    var _fn${tapIndex} = _x[${tapIndex}];
    `;
    switch (tapInfo.type) {
      case "sync":
        code += `_fn${tapIndex}(${this.#args()});\n`;
        break;
      case "async":
        code += `_fn${tapIndex}(${this.#args()}, (function (){
          if(--_counter === 0) _done();
        }));\n`;
        break;
      case "promise":
        code += `
          var _promise${tapIndex} = _fn${tapIndex}(${this.#args()});
          _promise${tapIndex}.then(() => {
            if(--_counter === 0) _done();
          });
        `;
        break;
    }
    return code;
  }
  /**
   *
   * @param {{type:"sync"|"async",taps:Array<Function>, args:string[]}} options
   */
  #init(options) {
    this.options = options;
  }
  /**
   *
   * @param {{type:"sync"|"async"|"promise",taps:Array<Function>, args:string[]}} options
   */
  create(options) {
    // 初始化创建
    this.#init(options);
    let fn;
    switch (this.options.type) {
      case "sync":
        // content方法 也就是具体的事件函数调用 会由子类实现
        fn = new Function(this.#args(), this.#header() + this.content());
        break;
      case "async":
        // 追加一个形参 _callback 也可以认为是next函数 执行就调用下一个事件函数
        fn = new Function(
          this.#args({ after: "_callback" }),
          this.#header() + this.content({ onDone: () => "_callback();\n" })
        );
        break;
      case "promise":
        const tapsContent = this.content({ onDone: () => "resolve();\n" });
        let content = `
        return new Promise((resolve, reject) => {
          ${tapsContent}
        });
        `;
        fn = new Function(this.#args(), this.#header() + content);
        break;
      default:
        break;
    }
    // 销毁
    this.#deInit();
    return fn;
  }
  #deInit() {
    this.options = null;
  }
}
module.exports = HookCodeFactory;
```

**AsyncParallelHook.js**:

```js
const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");
class AsyncParallelHookCodeFactory extends HookCodeFactory {
  content({ onDone } = { onDone: () => "_callback();" }) {
    // 并行
    return this.callTapsParallel({ onDone });
  }
}
const factory = new AsyncParallelHookCodeFactory();
/**
 * 异步并行钩子
 */
class AsyncParallelHook extends Hook {
  compile(options) {
    factory.setup(this, options);
    return factory.create(options);
  }
}
module.exports = AsyncParallelHook;
```

**当然**，并不是说上面的实现就是很完美的，如果我们每种注册方式和触发方式都分开使用，当然是OK的。可是如果混合使用的情况，那就不是很OK了。可以想想中间应该如何调用并执行？

## 拦截器 interceptor

### interceptor

- 所有的钩子都提供额外的拦截器API
  - call：`(...args) => void`当你的钩子触发之前，就是call调用之前，就会触发这个函数，你可以访问钩子的参数，多个钩子执行一次。
  - tap:`(tap:Tap)=>void` 每个钩子执行之前（多个钩子执行多个），就会触发这个函数
  - register:`(tap:Tap)=> Tap | undefined`每添加一个Tap都会触发你`interceptor`上的`register`，你下一个拦截器的`register`函数得到的参数，取决于你上一个`register`返回的值，所以你最好返回一个`tap`钩子
- Context(上下文)插件和拦截器都可以选择加入一个可选的context对象，这个可以被用于传递随意的值到队列中的插件和拦截器

**拦截器的基本使用**：
本质就是吧拦截器暂存起来，register就是在调用tap方法时进行执行，tap钩子就是在每次执行一个事件函数之前就执行一次tap函数，call拦截器就是在执行所有事件函数的第一个函数之前，执行一次。
如果想要修改我们的tapInfo，也是可以在register的时候进行修改的，只要有返回值就会替换原来的。
tapInfo中一般会记录当前注册的事件函数的类型name，事件函数，以及同步异步等信息。

```js
const hook = new SyncHook(["name", "age"]);
// 注册拦截器
hook.intercept({
  // 当你触发一个新的回调的时候会触发 可以修改tapInfo的内容
  register(tapInfo) {
    console.log("拦截器1开始 register");
    return tapInfo;
  },
  // 每次执行事件函数都会触发
  tap(tapInfo) {
    console.log("拦截器1的tap");
  },
  // 执行第一个事件函数前触发
  call(name, age) {
    console.log("拦截器1的call：", name, age);
  },
});
hook.tap("1", (name, age) => {
  console.log("-----------------", 1, name, age);
});
hook.tap("2", (name, age) => {
  console.log("-----------------", 2, name, age);
});
hook.call("zs", 22);
```

### 拦截器的实现原理

只需要修改部分代码就可以实现拦截器的功能。
**Hook.js**:

```js
class Hook {
  /**
   *
   * @param {Array} args
   */
  constructor(args = []) {
    /**
     * 事件函数形参列表
     * @type {Array<string>}
     */
    this.args = args;
    /**
     * 存放事件函数
     * @type {Array<{name:string,fn:Function,type:"sync"|"async"}>}
     */
    this.taps = [];
    //  假的call方法 占位
    this.call = CALL_DELEGATE;
    this.callAsync = CALL_ASYNC_DELEGATE;
    this.promise = PROMISE_DELEGATE;
    // 将会存放要执行的事件处理函数
    this._x = null;
    // 拦截器数组
    /**
     * @type {Array<{tap:Function,call:Function,register:Function}>}
     */
    this.interceptors = [];
  }
  // .......
  /**
   * 注册拦截器
   * @param {{tap:Function,call:Function,register:Function}} interceptor
   */
  intercept(interceptor) {
    this.interceptors.push(interceptor);
  }
  /**
   * @param {"sync"|"async"} type 调用类型
   * @param {string|{name:string}} options 可以直接是字符串名字 也可以是对象 有name属性
   * @param {Function} fn
   */
  #_tap(type, options, fn) {
    if (typeof options === "string") {
      options = { name: options };
    }
    // 两个属性 name fn
    let tapInfo = { ...options, fn, type };
    // 执行注册拦截器 register
    tapInfo = this.#runRegisterInterceptors(tapInfo);
    this.#insert(tapInfo);
  }
  /**
   * 执行register拦截器 可以改变tapInfo的
   * @param {{name:string,fn:Function,type:"sync"|"async"|"promise"}}} tapInfo
   */
  #runRegisterInterceptors(tapInfo) {
    for (const interceptor of this.interceptors) {
      if (typeof interceptor.register === "function") {
        const newTapInfo = interceptor.register(tapInfo);
        if (typeof newTapInfo !== "undefined") {
          tapInfo = newTapInfo;
        }
      }
    }
    return tapInfo;
  }
  /**
   *
   * @param {"sync"|"async"} type
   */
  _createCall(type) {
    // 执行编译 生成 call方法 交给子类实现的
    return this.compile({
      taps: this.taps,
      args: this.args,
      type,
      interceptors: this.interceptors,
    });
  }
}
// ...
```

**HookCodeFactory.js**:

```js
const Hook = require("./Hook");
/**
 * 创建代码函数工厂
 */
class HookCodeFactory {
  // ...
  #header() {
    const interceptors = this.options.interceptors;
    let code = `
    // header
    var _x = this._x;\n`;
    // 拦截器 call拦截器的实现
    if (interceptors.length > 0) {
      code += `var _taps = this.taps;
      var _interceptors = this.interceptors;
      `;
      for (let k = 0; k < interceptors.length; k++) {
        const interceptor = interceptors[k];
        if (typeof interceptor.call === "function") {
          code += `_interceptors[${k}].call(${this.#args()});\n`;
        }
      }
    }
    return code;
  }
  #callTap(tapIndex) {
    const tapInfo = this.options.taps[tapIndex];
    let code = `var _tap${tapIndex} = _taps[${tapIndex}];\n`;
    const interceptors = this.options.interceptors;
    for (let i = 0; i < interceptors.length; i++) {
      const interceptor = interceptors[i];
      if (interceptor.tap) {
        code += `_interceptors[${i}].tap(_tap${tapIndex});\n`;
      }
    }
    code += `
    var _fn${tapIndex} = _x[${tapIndex}];
    `;
    switch (tapInfo.type) {
      case "sync":
        code += `_fn${tapIndex}(${this.#args()});\n`;
        break;
      case "async":
        code += `_fn${tapIndex}(${this.#args()}, (function (){
          if(--_counter === 0) _done();
        }));\n`;
        break;
      case "promise":
        code += `
          var _promise${tapIndex} = _fn${tapIndex}(${this.#args()});
          _promise${tapIndex}.then(() => {
            if(--_counter === 0) _done();
          });
        `;
        break;
    }
    return code;
  }
}
module.exports = HookCodeFactory;
```

**对于需要修改代码的地方我已经指出**，无非就是在特定的执行时机插入相关的拦截器进行执行。就是我们常说的AOP。

## HookMap

可以帮助我们批量创建hook钩子。
该类实例化需要传入一个工厂函数，函数的返回值就是实例化的hook对象。每次调用hookMap实例化对象的for方法，都回去找其内部有没有已经创建好的同名hook，没有就重新创建，有就可以复用。

```js
const { SyncHook, HookMap, AsyncParallelHook } = require("tapable");

const keyedHookMap = new HookMap(() => new SyncHook(["name"]));
keyedHookMap
  .for("key1")
  .tap("plugin1", (name) => console.log(name, "---------"));
keyedHookMap
  .for("key1")
  .tap("plugin2", (name) => console.log(name, "---------"));
keyedHookMap
  .for("key2")
  .tap("plugin1", (name) => console.log(name, "---------"));
keyedHookMap
  .for("key2")
  .tap("plugin2", (name) => console.log(name, "---------"));

keyedHookMap.for("key1").call("zs");
keyedHookMap.for("key2").call("ls");

const keyedHookMap2 = new HookMap(() => new AsyncParallelHook(["name"]));
console.time("async");
keyedHookMap2.for("key3").tapAsync("plugin1", (name, next) => {
  setTimeout(() => {
    console.log(name, "---------");
    next();
  }, 1000);
});
keyedHookMap2.for("key3").tapAsync("plugin2", (name, next) => {
  setTimeout(() => {
    console.log(name, "---------");
    next();
  }, 2000);
});
keyedHookMap2.for("key3").tapAsync("plugin3", (name, next) => {
  setTimeout(() => {
    console.log(name, "---------");
    next();
    console.timeEnd("async");
  }, 3000);
});

keyedHookMap2.for("key3").callAsync("zs", (err) => {
  console.log(err);
});
```

使用方式并没有什么难度。

### HookMap的原理

学过前面的东西，这玩意就很容易了。

```js
class HookMap {
  #map = new Map();
  #factory;
  constructor(hookFactory) {
    this.#factory = hookFactory;
  }
  for(key) {
    const hook = this.get(key);
    if (hook) return hook;
    const newHook = this.#factory();
    this.#map.set(key, newHook);
    return newHook;
  }
  get(key) {
    return this.#map.get(key);
  }
  tapAsync(key, options, fn){
    return this.for(key).tapAsync(options, fn)
  }
  tapPromise(key, options, fn){
    return this.for(key).tapPromise(options, fn)
  }
}
module.exports = HookMap;
```

**为什么要创建一组hook？**：
首先有明白，在一个前端工程化的项目中，很明显会有不同类型的文件，`js,ts,jsx,tsx,vue,png,json`等不同类型文件。
在webpack中，每一个文件都是模块，但是不同的文件是不同的模块，不同的模块对应不同的模块工厂，不同的模块工厂会对应不同的钩子。

## stage

比如我们写一些回调函数，webpack打包会分成很多阶段：

1. 分析参数
2. 创建模块
3. 生成chunk
4. 生成文件

就例如我们的loader，实际项目中可能是由多个配置文件合并在一起的，我们很难完全规定书写的顺序。`pre post normal inline`等的出现其实也是为了解决这种问题

所以我们注册插件，或者说钩子的事件函数的注册，也是可以指定优先级，state越小，优先级越高。越是先执行相关的事件函数。

```js
const { SyncHook } = require("tapable");

const hook = new SyncHook(["name"]);
// 注册的顺序和执行的顺序不一致 可以有优先级的概念 那就用到了stage属性了
hook.tap({ name: "tap1", stage: 1 }, (name) => {
  console.log(name, "-----------", "tap1");
});

hook.tap({ name: "tap3", stage: 3 }, (name) => {
  console.log(name, "-----------", "tap3");
});

hook.tap({ name: "tap5", stage: 5 }, (name) => {
  console.log(name, "-----------", "tap5");
});

hook.tap({ name: "tap2", stage: 2 }, (name) => {
  console.log(name, "-----------", "tap2");
});

hook.call("zs");
/**
 *  zs ----------- tap1
    zs ----------- tap2
    zs ----------- tap3
    zs ----------- tap5
 */
```

### state的原理

其实原理很简单，就是缓存事件函数的时候，每次注册的同时进行一下排序就行了。最简单的当然就是插入排序了。

修改Hook.js的一些代码：

```js
class Hook{
  #_tap(type, options, fn) {
    if (typeof options === "string") {
      options = { name: options, stage: Number.MAX_SAFE_INTEGER };
    }
    // 两个属性 name fn type stage属性 默认值 MAX_INTEGER
    let tapInfo = { stage: Number.MAX_SAFE_INTEGER, ...options, fn, type };
    // 执行注册拦截器 register
    tapInfo = this.#runRegisterInterceptors(tapInfo);
    this.#insert(tapInfo);
  }
  #insert(tapInfo) {
    // TODO 有stage进行插入排序 默认全都有了
    let i = this.taps.length;
    if (!i) {
      this.taps.push(tapInfo);
      return;
    }
    while (i--) {
      if (this.taps[i].stage <= tapInfo.stage) {
        this.taps[i + 1] = tapInfo;
        break;
      } else {
        this.taps[i + 1] = this.taps[i];
      }
    }
  }
}
```

其实就是排个序而已，没什么难度。

### before

有时候，我们的事件函数的执行，并不知道会在什么时机，也不知道应该在哪个stage的时候要执行。但如果知道要在哪个事件函数之前，或者多个事件函数之前执行，那么我们可以使用before属性来指定当前事件函数在其他事件函数之前执行。

打个比方，你不知道你leader的工资是多少，突然你遇到一个神仙，他说可以实现你一个愿望，你虽然不知道leader到底挣多少钱，但是肯定比你多，所以你就可以许愿挣钱比leader更多。

如下的例子，就是tap2在tap5前执行，然后顺序执行tap1，tap3.

```js
const { SyncHook } = require("tapable");
const hook = new SyncHook(["name"]);
// 注册的顺序和执行的顺序不一致 可以有优先级的概念 那就用到了stage属性了
hook.tap({ name: "tap1" }, (name) => {
  console.log(name, "-----------", "tap1");
});
hook.tap({ name: "tap3" }, (name) => {
  console.log(name, "-----------", "tap3");
});
hook.tap({ name: "tap5", before: ["tap1", "tap3"] }, (name) => {
  console.log(name, "-----------", "tap5");
});
hook.tap({ name: "tap2", before: ["tap5"] }, (name) => {
  console.log(name, "-----------", "tap2");
});
hook.call("zs");
/**
  zs ----------- tap2
  zs ----------- tap5
  zs ----------- tap1
  zs ----------- tap3
 */
```

当然这个的实现其实也很简单，比如弄个set啥的来处理就好了。。不再哔哔。

## plugin

做了那么多铺垫，来到了插件环节了。
插件向第三方开发者提供了webpack引擎中完整的能力。使用阶段式的构建回调，开发者可以引入他们自己的行为到webpack构建流程中。创建插件比创建`loader`更加**高级**，因为你将需要理解一些webpack底层的内部特性来做相应的钩子。

### 为什么需要插件

- `webpack`基础配置无法满足要求
- 插件几乎能够任意修改webpack编译结果
- `webpack`内部也是通过大量的内部插件实现的

### 可以加载插件的常用对象

对象：

1. Compiler：`run`，`compile`，`compilation`, `make`, `emit`,`done`
2. Compilation：buildModule，normalModuleLoader，succeedModule，finishModules，seal，optimize，after-seal
3. Module Factory：beforeResolver，afterResolver，module，parser

模块：Module

1. Parser：program，statement，call，expression
2. Template：hash，bootstrap，localVars，render

### 创建插件

一个最简单的插件就是一个类，有一个apply方法。

```js
class WebpackDonePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // 同步调用
    console.log("webpack done plugin -----------");
    // 注册异步回调
    compiler.hooks.done.tapAsync("WebpackDonePlugin", (stats, callback) => {
      // stats 本次编译的结果 modules chunks entries assets filenames
      console.log(stats);
      callback()
    });
  }
}
module.exports = WebpackDonePlugin;
```

### Compiler 和 Compilation

在插件开发中最重要的两个资源就是 `compiler`和`compilation`对象。理解他们的角色是扩展`webpack`引擎的重要的第一步。

- compiler 对象代表了完整的`webpack`环境配置。这个对象在启动webpack时被一次性建立，并配置好所有可操作的设置，包括options，loader和plugin。当在webpack环境中应用一个插件时，插件将收到此compiler对象的引用。可以使用它来访问webpack的主环境。
- `compilation`对象代表了一次资源版本构建。当运行 `webpack`开发环境中间件时，每当检测到文件的变化，就会创建一个新的`compilation`，从而生成一组新的编译资源。一个`compilation`对象表现了当前的模块资源，编译生成资源，变化的文件，以及被跟踪依赖的状态信息。`compilation`对象也提供许多关机时机的回调，以供插件做自定义处理时选择使用。

### 基本插件架构

- 插件是由`[具有apply方法的prototype对象]`所实例化出来的
- 这个 `apply`方法安装插件时，会被`webpack compiler`调用一次
- apply方法可以接收到`webpack compiler`对象的引用，从而可以在回调函数中访问到`compiler`对象

### 编写插件

一个可以输出打包后chunk的id和name等的插件：

```js
/**
 * 打印本次产出的代码块和文件
 */
class WebpackAssetsPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // 每当webpack开启一次新的编译 就会创建一个新的compilation
    compiler.hooks.compilation.tap("WebpackAssetsPlugin", (compilation) => {
      // 每当根据chunk创建一个新的文件后 会触发一次chunkAsset钩子
      compilation.hooks.chunkAsset.tap(
        "WebpackAssetsPlugin",
        (chunk, filename) => {
          // 代码块的 name 或者 id filename是打包的名字
          console.log(chunk.name || chunk.id, filename);
        }
      );
    });
  }
}
module.exports = WebpackAssetsPlugin;
```



### 打包资源为压缩包的插件

```js
const jszip = require("jszip");
const { RawSource } = require("webpack-sources");
const { Compilation } = require("webpack");
// 将打包产物压缩成压缩包
/**
 * 1. 如何获取打包后的文件名和文件内容
 * 2. 如何实现压缩包
 * 3. 如何向目标目录输出压缩包
 */
module.exports = class WebpackArchivePlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    // emit 钩子是webpack在确定好输出的文件名和文件内容之后 在写入谁的之前触发的，这是最后一个改变输出文件的机会
    // compilation 
    compiler.hooks.compilation.tap("webpackArchivePlugin", (compilation) => {
      // processAssets 处理资源的钩子 在 compiler.hooks.emit钩子执行之前执行了
      // 当确定好文件 当你处理每个资源的时候执行
      compilation.hooks.processAssets.tapPromise(
        {
          name: "webpackArchivePlugin",
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          // assets => 文件名：文件内容
          const zip = new jszip();
          for (const filename in assets) {
            // 资源对象
            const sourceObj = assets[filename];
            // 资源的源代码
            const sourceCode = sourceObj.source();
            // 放入资源
            zip.file(filename, sourceCode);
          }
          // 压缩
          return zip
            .generateAsync({ type: "nodebuffer" })
            .then((zipContent) => {
              // 放入资源
              assets[`archive_${Date.now()}.zip`] = new RawSource(zipContent);
            });
        }
      );
    });
  }
};
```

最终产物里多了一个所有打包资源压缩为的一个压缩包，方便备份。



### 外链插件

对于一些工具库，例如`lodash`这种，我们希望可以走`cdn`，那么就需要用到外链插件了。

1. 在`index.html`中通过脚本引入外链的工具库，也就是走cdn
2. 打包的时候，不再打包工具库到最终产物里
3. 在webpack配置文件中的externals属性中配置

其实webpack已经提供的这种功能，我们只需在配置文件中提供一个externals的选项配置即可:

```js
module.exports = {
  // 配置模块外链 原理是不再打包对应的lodash模块了（值就是模块导出的变量）
  // 最终打包时 这些模块导出的内容是从 window.xxx 也就是说从window上取出来的
  externals: {
    lodash: "_",
  },
}
```

打包后的产物，其实就是将导出的内容指向window上的属性了。

```js
  var modules = {
    lodash: (module) => {
      module.exports = _;// window._
    },
  };
```

#### 需求

我们的想法就是写一个插件，自动帮我们完成上面的操作，比如index.html文件中引入cdn资源。创建外链的模块指向全局window上的属性等。

```js
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
```

**插件的编写本身就是很复杂的事情，所以也没必要太较真了。知道如何编写，然后有问题就参考文档摸索了。**



## optimize

### 减少查找范围

配置拓展名，配置别名，以及模块和loader的查找方式！

```js
const path = require("path");
module.exports = {
  // ...
  module: {
    rules: [{ test: /\.css$/, use: ["style-loader", "css-loader"] }],
  },
  // 配置如何解析模块路径
  resolve: {
    // 尝试添加的文件拓展名
    extensions: [".js", ".jsx", "json"],
    // 别名
    alias: {
      // bootstrap模块指向我们配置的位置
      bootstrap: path.resolve(
        __dirname,
        "node_modules/bootstrap/dist/css/bootstrap.css"
      ),
    },
    // xxx可以是我们自己的模块目录 可以先去自己的模块目录中找模块
    modules: ["xxx", "node_modules"],
    // 找一个包中的package.json的主入口 配置其main字段 也就是找主入口对应的属性
    mainFields: ["module", "main", "base"],
    // 指定主入口文件名
    mainFiles: ["base", "main"],
  },
  resolveLoader:{
    // 上面的resolve属性在这里都有 但是只是在找loader的时候生效
  }
};
```

