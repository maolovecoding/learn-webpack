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
