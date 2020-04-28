import React from 'react';

class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      functions: [
        {
          str: "Iterate/Deiterate",
          func: 'iterate',
          highlight: { 'cut': 'all' }
        },
        {
          str: "Remove Double Cut",
          func: 'dcRemove',
          highlight: { 'cut': 'all' }
        },
        {
          str: "Add Double Cut",
          func: 'dcAdd',
          highlight: { 'cut': 'all', 'var': 'all' }
        },
        {
          str: "Insertion",
          func: 'insert',
          highlight: { 'cut': 'odd', 'var': 'odd' }
        },
        {
          str: "Erasure",
          func: 'erase',
          highlight: { 'cut': 'even', 'var': 'even' }
        }
      ]
    };
  }

  componentDidMount() {  
  }

  render() {
    if (this.props.hidden) return <React.Fragment />;
    return (
      <div className="toolbox" ref={this.canvas}>
        <h3>Tools</h3>
        {this.state.functions.map(el => (
          <div className="tool" onClick={() => this.props.setSelection(el.highlight, el.func)}>{el.str}</div>
        ))}
      </div>
    );
  }
}

export default Toolbox;