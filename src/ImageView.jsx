import React from 'react'
import styled from 'styled-components'

const ImagePane = styled.div``

function ImageView(props) {
    const { images, image_list } = props;

    const visImgs = image_list.filter(name => name in images).map(name => (
        <div key={images[name]}>
            <img src={"data:image/jpg;base64," + images[name]} alt="" width="100%" />
        </div>
    ));

    return (
        <ImagePane id="imagepane">
            { visImgs }
        </ImagePane>
    );
}

export default ImageView;