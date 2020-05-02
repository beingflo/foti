import React from 'react'
import ImageView from './ImageView'

const ws_address = 'ws://192.168.1.196:5678/ws'

const concurrent_image_requests = 30
const reload_percentage = 0.8

class Images extends React.Component {
    constructor(props) {
        super(props);

        const is_web = window.matchMedia("(min-width: 1000px)")

        let ncolumns;
        if(is_web.matches) {
            ncolumns = 5
        } else {
            ncolumns = 3
        }

        this.state = {
            images: {},
            image_list: [],
            image_list_filtered: [],
            columns: ncolumns,
            downloaded_idx: 0,
            outstanding_requests: 0,
            filter: '',
            fullscreen_imagename: '',
            fullscreen_image: null,
            scroll_at_click: 0,
            exiting_fullscreen: false,
        }

        this.ws = new WebSocket(ws_address)
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
        const image = document.getElementById('image0')
        if(image === null) {
            return;
        }

        const real_height = (image.clientHeight * this.state.downloaded_idx) / this.state.columns

        const adaptive_reload_percentage = reload_percentage * Math.min(real_height / 10000, 1)

        if (window.scrollY >= adaptive_reload_percentage * real_height) {
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

            if(response['type'] === 'error') {
                this.setState(prevState => ({
                    outstanding_requests: prevState.outstanding_requests - 1,
                }));

            } else if (response['type'] === 'filterresponse') {
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
                const level = response['level']

                if(level === 'l2') {
                    this.setState(prevState => ({
                        images: {
                            ...prevState.images,
                            [name]: image
                        },
                        outstanding_requests: prevState.outstanding_requests - 1,
                    }), () => this.checkAndFetch())
                } else {
                    // Disregard message, as image was already minimized again
                    if(!(this.state.fullscreen_imagename === '')) {
                        this.setState({ fullscreen_image: image })
                    }
                }

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
                new_filtered_list = this.state.image_list
            } else if(props_filter.includes(state_filter)) {
                new_filtered_list = this.state.image_list_filtered.filter(name => name.toLowerCase().includes(props_filter))
            } else {
                new_filtered_list = this.state.image_list.filter(name => name.toLowerCase().includes(props_filter))
            }

            this.setState({ filter: this.props.filter, image_list_filtered: new_filtered_list, downloaded_idx: 0 }, () => this.fetchImages())

            window.scrollTo(0,0)
        }

        if(this.state.exiting_fullscreen) {
            window.scrollTo(0, this.state.scroll_at_click)

            this.setState({ exiting_fullscreen: false })
        }
    }

    handle_image_click(e) {
        const name = e.currentTarget.dataset.id

        this.fetchSingleImage(name, 'l1')

        this.setState({
            fullscreen_imagename: name,
            scroll_at_click: window.scrollY,
        });
    }

    handle_fullscreen_exit() {
        this.setState({
            fullscreen_image: null,
            fullscreen_imagename: '',
            exiting_fullscreen: true,
        })

        console.log(this.state.scroll_at_click)
    }

    render() {
        let ret;
        if(this.state.fullscreen_imagename === '') {
            ret = <ImageView ncolumns={this.state.columns} images={this.state.images} image_list={this.state.image_list_filtered} image_click={(e) => this.handle_image_click(e)} />
        } else {
            let image = this.state.images[this.state.fullscreen_imagename]
            if(this.state.fullscreen_image !== null) {
                image = this.state.fullscreen_image
            }
            ret = <img src={"data:image/jpg;base64," + image} onClick={() => this.handle_fullscreen_exit()} alt="" width="100%" />
        }

        return ret;
    }
}

export default Images;