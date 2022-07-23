function load(source) {
  console.log("loader 1 ......");
  return source + "//loader1";
}
module.exports = load;
