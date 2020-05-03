import React from 'react'
import styled from 'styled-components'
import TrackVisibility from 'react-on-screen';

const ImagePane = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const ColumnContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Image = styled.div`
    padding: 0px 2px;
`;

const RoundedImage = styled.img`
    border-radius: 2px;
`;

const ImageComponent = ({ isVisible, images, image_list, image_click, i }) => {
    const style = {
        borderRadius: isVisible ? '0px' : '0px'
    }
    return ( 
        <Image data-id={image_list[i]} id={"image" + i} key={image_list[i]} onClick={(e) => image_click(e)}>
            <RoundedImage style={style} src={"data:image/jpg;base64," + images[image_list[i]]} alt="" width="100%" />
        </Image>
    )
};

function ImageView(props) {
    const { images, image_list, image_click, ncolumns } = props;

    let columns = []
    for(let k = 0; k < ncolumns; k += 1) {
        columns[k] = []
    }

    let i = 0;

outer:
    while(i < image_list.length && image_list[i] in images) {
        let j;
        for(j = 0; j < ncolumns; j += 1) {
            columns[j].push(
                <TrackVisibility partialVisibility key={i}>
                    <ImageComponent images={images} image_list={image_list} image_click={image_click} i={i} />
                </TrackVisibility>
            );

            i += 1

            if(i >= image_list.length || !(image_list[i] in images)) {
                break outer
            }
        }
    }

    return (
        <ImagePane id="imagepane">
            { columns.map((col, idx) => (
                <ColumnContainer key={idx}>
                    { col }
                </ColumnContainer>

            ))}
        </ImagePane>
    );
}

export default ImageView;