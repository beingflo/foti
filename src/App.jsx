import React from 'react'
import Images from './Images'
import Searchbar from './Searchbar'
import media from './media'
import styled from 'styled-components'

const Container = styled.div`
   ${media.mobile`
      margin: 0% 2%;
   `}
   ${media.web`
      margin: 0% 20%;
   `}
`

function App() {
    const [filter, setFilter] = React.useState('');

    return (
        <Container className="App">
            <Searchbar setFilter={setFilter} />
            <Images filter={filter} />
        </Container>
    );
}

export default App;
