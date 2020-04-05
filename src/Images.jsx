import React from 'react'
import styled from 'styled-components'
import media from './media'

const ws_address = 'ws://localhost:5678/ws'
const num_images_request = 10;
const reload_percentage = 0.8
const scroll_event_throttle = 1000

const ImageContainer = styled.div`
   ${media.mobile`
      margin: 4%;
   `}
   ${media.web`
      margin: 1% 35%;
   `}
`

const ImagePane = styled.div``

class Images extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image_names: [],
            images: {},
            num_images: 0,
            reached_end: false,
            folder: '',
            mounted: false
        }

        this.ws = new WebSocket(ws_address)
    }

    handleScroll(_event) {
        if(this.state.reached_end) {
            return;
        }
        const imagepane_height = document.getElementById('imagepane').clientHeight

        if (this.state.mounted && window.scrollY >= reload_percentage * imagepane_height) {
            for(let i = 0; i <= num_images_request; i++) {
                const filename = this.state.image_names[this.state.num_images + i]
                const request = `{
                    "type" : "image",
                    "dir" : "${this.state.folder}",
                    "file" : "${filename}"
                }`
                console.log("Requesting " + filename)
                if(filename === undefined) {
                    this.setState({ reached_end: true })
                    return;
                }
                this.ws.send(request)
            }
            this.setState({ num_images: this.state.num_images + num_images_request })
        }
    }

    componentDidMount() {
        window.addEventListener("scroll", (e) => this.handleScroll(e));
        this.setState({ mounted: true });

        this.ws.onopen = () => {
            console.log('Connected')

            // Request list of available images in root
            const query = `{
                "type" : "dir",
                "dir" : "2018/Eymatt"
            }`

            this.ws.send(query)
        }

        this.ws.onmessage = evt => {
            const message = evt.data
            const response = JSON.parse(message)

            if ('file' in response) {
                const images = {}
                response['file'].forEach(filename => {
                    images[filename] = [false, null];
                });

                this.setState({ images: images, image_names: response['file'], folder: response['dir'] });

                // Request first images
                for (let i = 0; i < num_images_request; i++) {
                    const request = `{
                        "type" : "image",
                        "dir" : "${this.state.folder}",
                        "file" : "${this.state.image_names[i]}"
                    }`
                    this.ws.send(request)
                }

                this.setState({ num_images: this.state.num_images + num_images_request })

            } else if ('image' in response) {
                const name = response['filename']
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
        const visImgs = this.state.image_names.filter((im_name, idx) => this.state.images[im_name][0]).map((im_name, idx) => (
            <ImageContainer key={im_name}>
                <img src={"data:image/jpg;base64," + this.state.images[im_name][1]} alt="" width="100%" />
            </ImageContainer>
        ));

        return (
            <ImagePane id="imagepane">
                { visImgs }
            </ImagePane>
        );
    }
}

export default Images;