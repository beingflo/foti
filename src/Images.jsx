import React from 'react'
import styled from 'styled-components'
import media from './media'

const VisibilitySensor = require('react-visibility-sensor').default;
const numRequest = 10;

const ImageContainer = styled.div`
   ${media.mobile`
      margin: 4%;
   `}
   ${media.web`
      margin: 4% 20%;
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

        this.ws = new WebSocket('ws://192.168.1.196:5678/ws')
    }

    onScroll(id, isVisible) {
        if (this.state.mounted && isVisible && id >= this.state.numImages - 10) {
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