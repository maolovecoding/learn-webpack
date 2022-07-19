const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 拷贝静态资源到打包目录
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = (env) => {
  return {
    mode: env.development ? "development" : "production",
    devtool: false,
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js",
    },
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
                  path.resolve(__dirname, "./plugins/babel-logger.js"),
                  [
                    path.resolve(__dirname, "./plugins/babel-plugin-import.js"),
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
    // 插件
    plugins: [
      // html插件
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "public/index.ejs"),
      }),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ["**/*"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "public"),
            to: path.resolve(__dirname, "dist"),
            filter: (filepath) => {
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
