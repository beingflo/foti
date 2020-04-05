import React from 'react'
import styled from 'styled-components'
import media from './media'

const VisibilitySensor = require('react-visibility-sensor').default;

const ws_address = 'ws://localhost:5678/ws'
const numRequest = 10;
const scrollDistance = 20

const ImageContainer = styled.div`
   ${media.mobile`
      margin: 4%;
   `}
   ${media.web`
      margin: 1% 35%;
   `}
`

class Images extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numImages: 0,
            images: [],
            mounted: false
        }

        this.ws = new WebSocket(ws_address)
    }

    onScroll(id, isVisible) {
        if (this.state.mounted && isVisible && id >= this.state.numImages - scrollDistance) {
            console.log("id: " + id)
            console.log("numImages: " + this.state.numImages)
            console.log("Requesting %s images", numRequest)
            this.ws.send(numRequest)
        }
    }

    componentDidMount() {
        this.setState({ mounted: true });

        this.ws.onopen = () => {
            console.log('Connected')

            // Request initial images
            this.ws.send(numRequest)
        }

        this.ws.onmessage = evt => {
            const message = evt.data
            this.setState(prevState => ({
                images: [...prevState.images, message],
                numImages: prevState.numImages + 1
            }))

            console.log('Message received')
            console.log(this.state.numImages)
        }

        this.ws.onclose = () => {
            console.log('Disconnected')
        }
    }

    render() {
        const visImgs = this.state.images.map((im, idx) => (
            <VisibilitySensor onChange={(isVisible) => this.onScroll(idx, isVisible)} partialVisibility>
                <ImageContainer>
                    <img src={"data:image/jpg;base64," + im} alt="" width="100%" />
                </ImageContainer>
            </VisibilitySensor>
        ));

        return (
            <div>
                {visImgs}
            </div>
        );
    }
}

export default Images;