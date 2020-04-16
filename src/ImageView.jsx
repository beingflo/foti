import React from 'react'
import styled from 'styled-components'

const ImagePane = styled.div``

function ImageView(props) {
    const { images, image_list } = props;

    let visImgs = []
    let i = 0;
    while(i < image_list.length && image_list[i] in images) {
        visImgs.push(
            <div key={images[image_list[i]]}>
                <img src={"data:image/jpg;base64," + images[image_list[i]]} alt="" width="100%" />
            </div>
        );

        i += 1
    }

    return (
        <ImagePane id="imagepane">
            { visImgs }
        </ImagePane>
    );
}

export default ImageView;