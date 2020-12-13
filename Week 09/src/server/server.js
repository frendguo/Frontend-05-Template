const http = require('http')
const fs = require('fs').promises

const port = 8080
const host = 'localhost'
http.createServer((request, response) => {
  let body = []
  request.on('error', (err) => {
    console.error(err)
  }).on('data', (chunk) => {
    body.push(chunk)
  }).on('end', () => {
    fs.readFile(__dirname + '/static/index.html')
      .then( contents => {
        body = Buffer.concat(body).toString()
        console.log('body: ', body)
        response.writeHead(200, { 'Content-Type': 'text/html'})
        response.end(contents)
      })
  })
}).listen(port)

console.log(`server run on ${host}:${port}`)