const MAX_OUTSTANDING_REQUESTS = 10

export class Connection {
    constructor(address) {
        this.ws = new WebSocket(address)
        this.address = address

        this.request_queue = []
        this.outstanding_requests = 0

    }

    setupWS() {
        this.ws.onopen = () => {
            console.log('Connected')

            // Request list of available images in root
            this.fetchImageList('');
        }

        const message_handler = evt => {
            if(this.request_queue.length > 0) {
                this.saveSend()
            }
            this.outstanding_requests -= 1

            // Invoke supplied function
            this.message_callback(evt)
        }

        this.ws.onmessage = message_handler

        this.ws.onclose = () => {
            console.log('Disconnected')
        }
    }

    setOnMessage(func) {
        this.message_callback = func
        this.setupWS()
    }

    sendInfo(info) {
        const request = `{
            "type" : "info",
            "info" : "${info}"
        }`

        this.request_queue.push(request)
        this.saveSend()
    }

    fetchImageList(filter) {
        const request = `{
            "type" : "filter",
            "filter" : "${filter}"
        }`

        this.request_queue.push(request)
        this.saveSend()
    }

    fetchImage(name, level) {
        console.log("Fetching " + level + ": " + name)

        const request = `{
            "type" : "image",
            "level" : "${level}",
            "name" : "${name}"
        }`

        this.request_queue.push(request)
        this.saveSend()
    }

    saveSend() {
        if(this.ws.readyState === WebSocket.OPEN) {
            while(this.request_queue.length > 0 && this.outstanding_requests < MAX_OUTSTANDING_REQUESTS) {
                this.outstanding_requests += 1
                const request = this.request_queue.shift()
                this.ws.send(request)
            }
        } else if(this.ws.readyState !== WebSocket.OPEN && this.ws.readyState !== WebSocket.CONNECTING) {
            this.ws = new WebSocket(this.address)
            this.setupWS()
        }
    }
}

export default Connection