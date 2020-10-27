import React from 'react';

class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      functions: [
        {
          str: "Iterate",
          func: 'iteration',
        },
        {
          str: "Deiterate",
          func: 'deiteration',
        },
        {
          str: "Wrap in Double Cut",
          func: 'doubleCutEnclose',
        },
        {
          str: "Add Double Cut",
          func: 'doubleCutAdd',
        },
        {
          str: "Remove Double Cut",
          func: 'doubleCutRemove',
        },
        {
          str: "Insertion",
          func: 'insertion',
        },
        {
          str: "Erasure",
          func: 'erasure',
        }
      ]
    };
  }

  componentDidMount() {  
  }

  render() {
    let { hidden, modifyCanvas, cancelSelection } = this.props;
    let { selected } = this.state;
    if (hidden) return <React.Fragment />;
    return (
      <div className="toolbox" ref={this.canvas}>
        <h3>Tools</h3>
        {this.state.functions.map((el, i) => (
          <div 
            className="tool"
            style={selected === i ? { backgroundColor: '#AFAFAA' } : {}} 
            onClick={() => {
              if (this.state.selected === i) {
                cancelSelection();
              }
              else {
                this.setState({ selected: i });
                modifyCanvas(el.func, () => {
                  this.setState({ selected: null });
                });
              }
            }
          }
          >{el.str}</div>
        ))}
      </div>
    );
  }
}

export default Toolbox;