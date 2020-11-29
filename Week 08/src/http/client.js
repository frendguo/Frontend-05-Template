const net = require('net')
const { parse, resolve } = require('path')

class Request{  
    constructor(p){
        this.method = p.method || 'GET'
        this.host = p.host
        this.port = p.port || 80
        this.path = p.path || '/'
        this.body = p.data
        this.headers = p.headers || Object.create(null)
        if(!this.headers['Content-Type'])
            this.headers['Content-Type'] = "application/x-www-form-urlencoded"

        if(this.headers['Content-Type'] === "application/json")
            this.bodyText = JSON.stringify(this.body)
        else if(this.headers['Content-Type'] === "application/x-www-form-urlencoded")
            this.bodyText = Object.keys(this.body).map(k=>`${k}=${encodeURIComponent(this.body[k])}`).join("&")
        
        this.headers['Content-Length'] = this.bodyText.length
    }

    send(connection){
        return new Promise((resolve, reject)=>{
            const parser = new ResponseParser()
            if(connection){
                connection.write(this.toString())
            }else{
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                },()=>{
                    connection.write(this.toString())
                })
            }
            connection.on('data', data=>{
                console.log('data:', data.toString())
                parser.receive(data.toString())
                if(parser.isFinised){
                    connection.end()
                    console.log(parser.response)
                    resolve(parser.response)
                }
            })
            connection.on('error', error=>{
                console.error(error)
                reject(error)
                connection.end()
            })
        })
    }
    
    toString(){ 
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(k=>`${k}: ${this.headers[k]}`).join('\r\n')}\r
\r
${this.bodyText}`
    }
}

class ResponseParser{
    constructor(){
        this.WAIT_STATUS_LINE = 0
        this.WAIT_STATUS_LINE_END = 1
        this.WAIT_HEADER_NAME = 2
        this.WAIT_HEADER_SPACE = 3
        this.WAIT_HEADER_VALUE = 4
        this.WAIT_HEADER_VALUE_END = 5
        this.WAIT_HEADER_LINE_BLOCK_END = 6
        this.WAIT_BODY= 7
        this.statusLine = ""
        this.headerName = ""
        this.headerValue = ""
        this.headers = {}
        this.bodyParser = null
        this.status = this.WAIT_STATUS_LINE
    }
    receive(string){
        for(let i=0; i<string.length; i++){
            this.receiveChar(string.charAt(i))
        }
    }
    get isFinised(){
        return this.bodyParser.isFinised
    }
    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join("")
        }
    }
    receiveChar(c){ //状态机实现
        if(this.status === this.WAIT_STATUS_LINE){
            if(c === '\r')
                this.status = this.WAIT_STATUS_LINE_END
            else
                this.statusLine += c
        }else if(this.status === this.WAIT_STATUS_LINE_END){
            if(c === '\n')
                this.status = this.WAIT_HEADER_NAME
        }else if(this.status === this.WAIT_HEADER_NAME){
            if(c === ':')
                this.status = this.WAIT_HEADER_SPACE
            else if(c === '\r'){   
                this.status = this.WAIT_HEADER_LINE_BLOCK_END
                this.bodyParser = new TrunckedBodyParser()
            }
            else
                this.headerName += c
        }else if(this.status === this.WAIT_HEADER_SPACE){
            if(c === ' ')
                this.status = this.WAIT_HEADER_VALUE
        }else if(this.status === this.WAIT_HEADER_VALUE){
            if(c === '\r'){
                this.status = this.WAIT_HEADER_VALUE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = this.headerValue = ''
            }else
                this.headerValue += c
        }else if (this.status === this.WAIT_HEADER_VALUE_END){
            if(c === '\n')
                this.status = this.WAIT_HEADER_NAME
        }else if(this.status === this.WAIT_HEADER_LINE_BLOCK_END){                
            if(c === '\n')
                this.status = this.WAIT_BODY
        }else if(this.status === this.WAIT_BODY){
            this.bodyParser.receive(c)
        }
        
    }
}

class TrunckedBodyParser{
    constructor(){
        this.WATIING_LENGTH = 0
        this.WATIING_LENGTH_END = 1
        this.READING_TRUNCK = 2
        this.WAITING_NEW_LINE = 3
        this.WAITING_NEW_LINE_END = 4
        this.length = 0
        this.content = []
        this.isFinised = false
        this.status = this.WATIING_LENGTH
    }
    receive(c){
        if(this.status === this.WATIING_LENGTH){
            if(c === '\r'){
                if(this.length === 0) 
                    this.isFinised = true
               this.status = this.WATIING_LENGTH_END 
            }else{
                this.length *= 16   
                this.length += parseInt(c, 16)
            }
        }else if(this.status === this.WATIING_LENGTH_END){
            if(c === '\n')
                this.status = this.READING_TRUNCK
        }else if(this.status === this.READING_TRUNCK){
            this.content.push(c)
            this.length--
            if(this.length ===  0){
                this.status = this.WAITING_NEW_LINE
            }
        }else if(this.status === this.WAITING_NEW_LINE){
            if(c === '\r')
                this.status =this.WAITING_NEW_LINE_END
        }else if(this.status === this.WAITING_NEW_LINE_END){
            if(c === '\n')
                this.status = this.WATIING_LENGTH
        }

    }
}

void async function(){
    let request = new Request({
        host: '127.0.0.1',
        port: 8080,
        path: '/',
        headers: {
            "X-Foo": "123456"
        },
        data: {
            "username":"jason",
            "password":"123456",
            "testChuncked": "a".repeat(100000) 
        }
    })

    let res = await request.send()
    console.log('response:',res)
}()
