import React from 'react'
import styled from 'styled-components'
import { throttle } from 'underscore'

const ws_address = 'ws://192.168.1.196:5678/ws'

const num_images_request = 10;
const reload_percentage = 0.7
const scroll_event_throttle = 500

const ImagePane = styled.div``

class Images extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            images: {},
            image_names: [],
            num_images: 0,
            reached_end: false,
            query: '',
            mounted: false
        }

        this.ws = new WebSocket(ws_address)
    }

    fetchImages() {
        if(this.state.reached_end) {
            return;
        }

        for(let i = 0; i <= num_images_request; i++) {
            // Reached end of list
            if(i + this.state.num_images >= this.state.image_names.length) {
                this.setState({ reached_end: true })
                return;
            }
            const name = this.state.image_names[this.state.num_images + i]
            const request = `{
                "type" : "image",
                "name" : "${name}"
            }`
            console.log("Requesting " + name)
            this.ws.send(request)
        }
        this.setState({ num_images: this.state.num_images + num_images_request })
    }

    fetchImageList() {
        const query = `{
            "type" : "query",
            "query" : "${this.state.query}"
        }`

        this.ws.send(query)
    }

    handleScroll(_event) {
        const imagepane_height = document.getElementById('imagepane').clientHeight

        if (this.state.mounted && window.scrollY >= reload_percentage * imagepane_height) {
            this.fetchImages();
        }
    }

    componentDidUpdate() {
        if(this.props.query !== this.state.query) {
            this.setState({
                images: {},
                image_names: [],
                num_images: 0,
                query: this.props.query,
                reached_end: false
            }, this.fetchImageList);
        }
    }

    componentDidMount() {
        window.addEventListener("scroll", throttle((e) => this.handleScroll(e), scroll_event_throttle));
        this.setState({ mounted: true });

        this.ws.onopen = () => {
            console.log('Connected')

            // Request list of available images in root
            this.fetchImageList();
        }

        this.ws.onmessage = evt => {
            const message = evt.data
            const response = JSON.parse(message)

            if (response['type'] === 'queryresponse') {
                console.log(response)
                let images = {}
                let image_names = []
                response['files'].forEach(file => {
                    const name = file['name']
                    images[name] = [false, null];
                    image_names.push(name)
                });

                this.setState({ images: images, image_names: image_names });

                // Request first images
                this.fetchImages();
            } else if (response['type'] === 'imageresponse') {
                const name = response['name']
                const image = response['image']

                this.setState(prevState => ({
                    images: {
                        ...prevState.images,
                        [name]: [true, image] 
                    }
                }))
            }
        }

        this.ws.onclose = () => {
            console.log('Disconnected')
        }
    }

    render() {
        const visImgs = this.state.image_names.filter((name, idx) => this.state.images[name][0]).map((name, idx) => (
            <div key={name}>
                <img src={"data:image/jpg;base64," + this.state.images[name][1]} alt="" width="100%" />
            </div>
        ));

        return (
            <ImagePane id="imagepane">
                { visImgs }
            </ImagePane>
        );
    }
}

export default Images;