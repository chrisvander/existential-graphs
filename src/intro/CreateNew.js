import React from 'react';
import verify from '../verifySentence';
import { convertToTeX, convertToEG, wrapVarsTeX } from '../converters';
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
    this.filename = React.createRef()
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
    let { useFitchNotation } = this.props;
    if (this.verify()) {
      let { premises, conclusion } = this.state;
      for (let i in premises) {
        premises[i] = useFitchNotation ? convertToEG(premises[i]) : wrapVarsTeX(premises[i])
      }
      conclusion = useFitchNotation ? convertToEG(conclusion) : wrapVarsTeX(conclusion)
      this.props.setupFunc(this.filename.current.value, { premises, conclusion, steps: [] })
    }
  }

  getFormulaCell(formula, i) {
    let tex, eg
    if (verify(formula)) {
      tex = convertToTeX(formula);
      if (this.props.useFitchNotation)
        eg = convertToEG(formula);
      else {
        eg = convertToEG(formula);
      }
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
        {this.props.useFitchNotation && <td>
          {eg && <TeX math={eg} />}
        </td>}
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
        <input ref={this.filename}/>
        <table className="formulaTable">
          
        </table>
        <h2>Premises</h2>
        <table className="formulaTable">
          <tbody>
            <tr>
                <td>
                  Formula
                </td>
              {this.props.useFitchNotation && <td>TeX notation</td>}
              <td>EG notation</td>
              <td className="close"/>
            </tr>
            {premises.map((formula,i) => this.getFormulaCell(formula, i))}
            <tr>
              <td className="interactive" onClick={() => this.setState({ premises: premises.concat(['']) }) }>
                <span className="plus" />Add New Premise
              </td>
              {this.props.useFitchNotation && <td/>}
              <td/><td className="close"/>
            </tr>
          </tbody>
        </table>
        <h2>Conclusion</h2>
        <table className="formulaTable">
          <tbody>
            {this.getFormulaCell(conclusion)}
          </tbody>
        </table>
      </div>
    );
  }
}

export default CreateNew;