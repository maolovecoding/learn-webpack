const { runLoaders } = require("loader-runner");
const path = require("path");
const fs = require("fs");
// enforce属性 是一个配置 用来决定loader的类型的 一般loader都是后面的先执行 这个属性是强制修改执行顺序的可以
// 入口模块文件路径
const entryFile = path.resolve(__dirname, "../src/index.js");
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

const parts = request.replace(/^-?!+/, "").split("!");
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
