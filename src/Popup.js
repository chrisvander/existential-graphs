import React from 'react';
import './Popup.scss';

class Popup extends React.Component {
  constructor(props) {
    super(props);
  
    this.bg = React.createRef()
    this.state = {
    };
  }

  componentDidMount() {
    let that = this
    this.bg.current.addEventListener('click', function(e) {
      if (e.target !== this)
        return;
      that.props.onClose()
    });
  }

  render() {
    return (
      <div className="popup-bg" ref={this.bg}>
        <div className="popup">
          <div className="header">
            <h1>{this.props.title}</h1>
          </div>
          <div className="body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default Popup;