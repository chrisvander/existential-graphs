import React from 'react';
import TeX from '@matejmazur/react-katex';

function GoalView({ conclusion, complete, disabled }) {
  return (
    <div className="goal-container">
      <h3>Goal</h3>
      <br />
      <TeX math={conclusion} />
      <br />
      <br />
      {!disabled && <p className={complete? 'green' : 'red'}>{complete ? 'Reached' : 'Incomplete'}</p>}
    </div>
  );
}

export default GoalView;