import React from 'react';
import { convertToTeX, convertToEG } from './converters';
// KATEX
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import './CreateNew.scss';

class CreateNew extends React.Component {
  constructor(props) {
    super(props);
  
    this.state = {
      premises: [
        'P&Q'
      ],
      conclusion: ''
    };
  }

  componentDidMount() {
  }

  getFormulaCell(formula, i) {
    let tex = convertToTeX(formula);
    let eg = convertToEG(formula);
    let formulaInput = <input />;
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
      </tr>
    );
  }

  render() {
    let { premises, conclusion } = this.state;
    return (
      <div>
        <h2>Premises</h2>
        <table className="formulaTable">
          {premises.map((formula,i) => this.getFormulaCell(formula,i))}
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