import React from 'react';

class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      functions: [
        {
          str: "Iterate",
          func: 'iteration',
          highlight: false
        },
        {
          str: "Remove Double Cut",
          func: 'doubleCutRemove',
          highlight: false
        },
        {
          str: "Add Double Cut",
          func: 'doubleCutAdd',
          highlight: false
        },
        {
          str: "Insertion",
          func: 'insertion',
          highlight: false
        },
        {
          str: "Erasure",
          func: 'erasure',
          highlight: false
        }
      ]
    };
  }

  componentDidMount() {  
  }

  render() {
    let { hidden, modifyCanvas } = this.props;
    if (hidden) return <React.Fragment />;
    return (
      <div className="toolbox" ref={this.canvas}>
        <h3>Tools</h3>
        {this.state.functions.map((el, i) => (
          <div 
            className="tool"
            style={el.highlight ? { backgroundColor: '#AFAFAA' } : {}} 
            onClick={() => {
              let new_func = this.state.functions;
              new_func[i].highlight = true;
              modifyCanvas(el.func, () => {
                let new_func = this.state.functions;
                new_func[i].highlight = false;
                this.setState({ functions: new_func });
              });
              this.setState({ functions: new_func });
            }
          }
          >{el.str}</div>
        ))}
      </div>
    );
  }
}

export default Toolbox;