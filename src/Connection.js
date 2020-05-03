export class Connection {
    constructor(address) {
        this.ws = new WebSocket(address)
    }

    setOnOpen(func) {
        this.ws.onopen = func
    }

    setOnMessage(func) {
        this.ws.onmessage = func
    }

    setOnClose(func) {
        this.ws.onclose = func
    }

    sendInfo(info) {
        const message = `{
            "type" : "info",
            "info" : "${info}"
        }`

        this.ws.send(message)
    }

    fetchImageList(filter) {
        const request = `{
            "type" : "filter",
            "filter" : "${filter}"
        }`

        this.ws.send(request)
    }

    fetchSingleImage(name, level) {
        console.log("Fetching " + level + ": " + name)

        const request = `{
            "type" : "image",
            "level" : "${level}",
            "name" : "${name}"
        }`
        this.ws.send(request)
    }
}

export default Connection