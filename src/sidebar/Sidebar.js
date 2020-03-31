import React from 'react';
import './Sidebar.scss';
import Draggable from '../Draggable';
import { convertToTeX, verifySentence } from '../converters';

// KATEX
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    
    this.formulaInput = React.createRef();
    this.state = {
      eq: "",
      expandedPreview: false,
      isValid: false
    };
  }

  componentDidMount() {
    this.formulaInput.current.addEventListener('input', (t) => {
      let s = convertToTeX(t.target.value)
      if (s !== null) {
        this.setState({ eq: s, isValid: verifySentence(t.target.value) });
        if (s === "") {
          this.setState({ expandedPreview: false })
        }
        else {
          this.setState({ expandedPreview: true })
        }
      }
    });
  }

  render() {
    return (
      <div className="sidepanel">
        <h1>Initialize Proof</h1>
        <div className="white-bg">
          <h2>Create Premises</h2>
          <input type="text" ref={this.formulaInput} placeholder="P & Q" />
          <div className={this.state.expandedPreview ? "tex-preview" : "tex-preview hide"}>
            <Draggable>
              <TeX math={this.state.eq} />
            </Draggable>
            <span className={this.state.isValid ? "add-btn" : "add-btn disabled"} />
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;