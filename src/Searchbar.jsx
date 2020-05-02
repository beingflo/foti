import React from 'react'
import styled from 'styled-components'

const Top = styled.div`
    position: sticky;
    top: 0;
    height: 6vh;
    box-sizing: border-box;
    background: white;

    padding: 0 2px;
`;

const Bar = styled.input`
    width: 100%;
    height: 4vh;
    box-sizing: border-box;
    font-size: 16px;

    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    border-radius: 4px;
    border: 1px solid #BBB;
    line-height: 20px;
    outline: none;    

    margin-top: 1vh;
    padding-left: 6px;
`;

class Searchbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            setFilter: props.setFilter,
        }
    }

    handleChange(event) {
        this.state.setFilter(event.target.value);
    }

    handleSubmit(event) {
        console.log('Submitted');
    }

    render() {
        return (
            <Top>
                <Bar type="text" value={this.state.search} onChange={event => this.handleChange(event)} />
            </Top>
        );
    }
}

export default Searchbar;