import React from 'react';

class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {  
  }

  render() {
    return (
      <div className="toolbox" ref={this.canvas}>
        <h3>Tools</h3>
      </div>
    );
  }
}

export default Toolbox;