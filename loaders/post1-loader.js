function loader(source) {
  console.log("post1  ......");
  return source + "//post1 loader";
}
loader.pitch = function () {
  console.log("post1 pitch !!!");
  const callback = this.async();
  setTimeout(callback, 3000);
};
module.exports = loader;
