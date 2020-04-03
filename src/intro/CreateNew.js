import React from 'react';
import verify from '../verifySentence';
import { convertToTeX, convertToEG } from '../converters';
// KATEX
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import './CreateNew.scss';

class CreateNew extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      premises: [
        ''
      ],
      conclusion: ''
    };

    this.handleChange.bind(this)
    this.removePremise.bind(this)
    this.verify = this.verify.bind(this)
    this.create = this.create.bind(this)
  }

  componentDidMount() {

  }

  handleChange(e, i) {
    if (i != null) {
      let { premises } = this.state;
      premises[i] = e.target.value;
      this.setState({ premises: premises })
    }
    else this.setState({ conclusion: e.target.value })
  }

  removePremise(index) {
    let { premises } = this.state;
    premises.splice(index, 1);
    this.setState({ premises: premises })
  }

  verify() {
    let { premises, conclusion } = this.state;
    for (let i in premises) {
      if (premises[i] === '' || !premises[i])
        return false;
    }
    if (conclusion === '' || !conclusion)
      return false;
    return true;
  }

  create() {
    console.log("Creating...")
    console.log("Verification concluded " + this.verify())
    if (this.verify()) {
      let { premises, conclusion } = this.state;
      this.props.setupFunc(premises, conclusion)
    }
  }

  getFormulaCell(formula, i) {
    let tex, eg
    if (verify(formula)) {
      tex = convertToTeX(formula);
      eg = convertToEG(formula);
    }
    let closeBtn = <td 
      className="close interactive" 
      onClick={() => this.removePremise(i)}>
        &#10005;
      </td>;
    let formulaInput = <input onChange={ (e) => this.handleChange(e,i) } />;
    if (i == null) {
      formulaInput = <input onChange={ (e) => this.handleChange(e) } />;
      closeBtn = <td className="close"/>;
    }
    if (i === 0) 
      closeBtn = <td className="close"/>;
    return (
      <tr>
        <td>
          {formulaInput}
        </td>
        <td>
          {tex && <TeX math={tex} />}
        </td>
        <td>
          {eg && <TeX math={eg} />}
        </td>
        { closeBtn }
      </tr>
    );
  }

  render() {
    let { premises, conclusion } = this.state;
    return (
      <div className="content full-width">
        <h1>Create New</h1>
        <h2>File Name</h2>
        <input />
        <table className="formulaTable">
          
        </table>
        <h2>Premises</h2>
        <table className="formulaTable">
          <tr>
              <td>
                Formula
              </td>
            <td>TeX notation</td><td>EG notation</td><td className="close"/>
          </tr>
          {premises.map((formula,i) => this.getFormulaCell(formula, i))}
          <tr>
            <td className="interactive" onClick={() => this.setState({ premises: premises.concat(['']) }) }>
              <span className="plus" />Add New Premise
            </td>
            <td/><td/><td className="close"/>
          </tr>
        </table>
        <h2>Conclusion</h2>
        <table className="formulaTable">
          {this.getFormulaCell(conclusion)}
        </table>
      </div>
    );
  }
}

export default CreateNew;