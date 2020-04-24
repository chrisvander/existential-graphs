import React from 'react';

class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      functions: [
        {
          str: "Iterate/Deiterate",
          func: this.props.functions.iterate
        },
        {
          str: "Double Cut",
          func: this.props.functions.dc
        },
        {
          str: "Insertion",
          func: this.props.functions.insert
        },
        {
          str: "Erasure",
          func: this.props.functions.erase
        }
      ]
    };
  }

  componentDidMount() {  
  }

  render() {
    return (
      <div className="toolbox" ref={this.canvas}>
        <h3>Tools</h3>
        {this.state.functions.map(el => (
          <div className="tool" onClick={el.func}>{el.str}</div>
        ))}
      </div>
    );
  }
}

export default Toolbox;