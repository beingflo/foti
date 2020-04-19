import React from 'react'
import ImageView from './ImageView'

const ws_address = 'ws://192.168.1.196:5678/ws'

const concurrent_image_requests = 10
const reload_percentage = 0.8

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
            fullscreen_image: '',
        }

        this.ws = new WebSocket(ws_address)
    }

    fetchSingleImage(name, level) {
        console.log("Fetching " + name)

        const request = `{
            "type" : "image",
            "level" : "${level}",
            "name" : "${name}"
        }`
        this.ws.send(request)
    }

    fetchImages(until=0) {
        let i = this.state.downloaded_idx;
        let req = this.state.outstanding_requests;

        if(until === 0) {
            until = this.state.image_list_filtered.length
        }

        until = Math.min(until, this.state.image_list_filtered.length)

        while(i < until && req < concurrent_image_requests + 5) {
            const name = this.state.image_list_filtered[i]

            // Not already fetched
            if(!(name in this.state.images)) {
                this.fetchSingleImage(name, 'l2')

                req += 1
            } else {
                console.log("Already fetched " + name)
            }

            i += 1
        }

        this.setState({ downloaded_idx: i, outstanding_requests: req })
    }

    checkAndFetch() {
        const imagepane = document.getElementById('imagepane')
        if(imagepane === null) {
            return;
        }

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
                }), () => this.checkAndFetch())
            }
        }

        this.ws.onclose = () => {
            console.log('Disconnected')
        }
    }

    componentDidUpdate() {
        if(this.props.filter !== this.state.filter) {
            // Only show images that match filter 
            const props_filter = this.props.filter.toLowerCase()
            const state_filter = this.state.filter.toLowerCase()
            let new_filtered_list;
            if(props_filter === '') {
                console.log("empty")
                new_filtered_list = this.state.image_list
            } else if(props_filter.includes(state_filter)) {
                console.log("contained")
                new_filtered_list = this.state.image_list_filtered.filter(name => name.toLowerCase().includes(props_filter))
            } else {
                console.log("different")
                new_filtered_list = this.state.image_list.filter(name => name.toLowerCase().includes(props_filter))
            }

            this.setState({ filter: this.props.filter, image_list_filtered: new_filtered_list, downloaded_idx: 0 }, () => this.fetchImages(10))

            window.scrollTo(0,0)
        }
    }

    handle_image_click(e) {
        const name = e.currentTarget.dataset.id

        this.fetchSingleImage(name, 'l1')

        this.setState({
            fullscreen_image: name,
        });
    }

    render() {
        let ret;
        if(this.state.fullscreen_image === '') {
            ret = <ImageView images={this.state.images} image_list={this.state.image_list_filtered} image_click={(e) => this.handle_image_click(e)} />
        } else {
            ret = <img src={"data:image/jpg;base64," + this.state.images[this.state.fullscreen_image]} alt="" width="100%" />
        }

        return ret;
    }
}

export default Images;