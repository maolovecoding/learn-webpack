function loader(source) {
  // 通过this 可以取到data数据
  console.log("-------------------------", this.data.id);
  console.log("inline1  ......");
  return source + "//inline1 loader";
}
// 配置pitch
loader.pitch = function (remainingRequest, precedingRequest, data) {
  // 这里给data赋值
  data.id = 1;
  console.log("inline 1 pitch !!!");
};
module.exports = loader;
