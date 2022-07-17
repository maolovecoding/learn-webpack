const http = require("http");

const server = http.createServer();

server.on("request", (req, res) => {
  const url = req.url;
  console.log(url)
  if (url === "/users") {
    res.write(
      JSON.stringify({
        name: "zs",
        age: 22,
      })
    );
    res.end()
  }
});
server.listen(7777, () => {
  console.log("running ...");
});
