import React from 'react'
import ImageView from './ImageView'

const ws_address = 'ws://127.0.0.1:5678/ws'

const concurrent_image_requests = 30
const reload_percentage = 0.9

class Images extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: {},
            image_list: [],
            image_list_filtered: [],
            downloaded_idx: 0,
            outstanding_requests: 0,
            filter: '',
        }

        this.ws = new WebSocket(ws_address)
    }

    fetchImages() {
        let i = this.state.downloaded_idx;
        let req = this.state.outstanding_requests;

        while(i < this.state.image_list_filtered.length && req < concurrent_image_requests + 5) {
            const name = this.state.image_list_filtered[i]

            // Not already fetched
            if(!(name in this.state.images)) {
                console.log("Fetching " + name)

                const request = `{
                    "type" : "image",
                    "name" : "${name}"
                }`
                this.ws.send(request)

                req += 1
            }

            i += 1
        }

        this.setState({ downloaded_idx: i, outstanding_requests: req })
    }

    checkAndFetch() {
        const imagepane_height = document.getElementById('imagepane').clientHeight

        if (window.scrollY >= reload_percentage * imagepane_height) {
            if(this.state.outstanding_requests < concurrent_image_requests) {
                this.fetchImages();
            }
        }
    }

    fetchImageList() {
        const filter = `{
            "type" : "filter",
            "filter" : "${this.state.filter}"
        }`

        this.ws.send(filter)
    }

    sendInfo(info) {
        const message = `{
            "type" : "info",
            "info" : "${info}"
        }`

        this.ws.send(message)
    }

    componentDidMount() {
        window.addEventListener("scroll", e => this.checkAndFetch())

        this.ws.onopen = () => {
            console.log('Connected')

            // Request list of available images in root
            this.fetchImageList();
        }

        this.ws.onmessage = evt => {
            const message = evt.data
            const response = JSON.parse(message)

            if (response['type'] === 'filterresponse') {
                let image_list = []
                response['files'].forEach(file => {
                    image_list.push(file['name'])
                });

                this.setState({ image_list: image_list, image_list_filtered: image_list, downloaded_idx: 0 });

                this.sendInfo('Got list of available images')

                // Request first images
                this.fetchImages();

            } else if (response['type'] === 'imageresponse') {
                const name = response['name']
                const image = response['image']

                this.setState(prevState => ({
                    images: {
                        ...prevState.images,
                        [name]: image
                    },
                    outstanding_requests: prevState.outstanding_requests - 1,
                }), this.checkAndFetch())
            }
        }

        this.ws.onclose = () => {
            console.log('Disconnected')
        }
    }

    componentDidUpdate() {
        if(this.props.filter !== this.state.filter) {
            // Only show images that match filter 
        }
    }

    render() {
        return <ImageView images={this.state.images} image_list={this.state.image_list} />
    }
}

export default Images;