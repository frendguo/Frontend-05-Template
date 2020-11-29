const http = require("http");

function main() {
  http.createServer(service).listen(8000);
  console.log("server started");
}

function service(request, response) {
  const chunks = [];

  request
    .on("error", console.error)
    .on("data", (chunk) => chunks.push(chunk))
    .on("end", () => {
      const body = Buffer.concat(chunks).toString();
      console.log("request body:", body);
      response.writeHead(200, { "Content-Type": "text/html" });
      response.end("Hello, world\n");
    });
}

main();