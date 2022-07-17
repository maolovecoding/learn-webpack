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
