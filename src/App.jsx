import React from 'react';
import './App.css';

const VisibilitySensor = require('react-visibility-sensor').default;
const images = importAll(require.context('/home/florian/tmp/images', false, /\.(png|jpe?g|svg)$/));

function importAll(r) {
  return r.keys().map(r);
}

class Images extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numImages: 10,
      mounted: false
    }
  }

  onChange (id, isVisible) {
    if(this.state.mounted && isVisible && id >= this.state.numImages - 5) {
      console.log("Changing numImages to %s", this.state.numImages)
      this.setState({numImages: this.state.numImages + 5})
    }
  }

  componentDidMount() {
    this.setState({mounted: true});
  }

  render() {
    const imgs = images.slice(0, this.state.numImages).map((image) => <img src={image} alt="" width="50%"/>);
    const visImgs = imgs.map((im, idx) => (
      <VisibilitySensor onChange={(isVisible) => this.onChange(idx, isVisible)} partialVisibility>
        {im}
      </VisibilitySensor>
    ));
    return (
      <div>
        {visImgs}
      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <Images />
    </div>
  );
}

export default App;
