import React from 'react';
import './Canvas.scss';
import html2canvas from 'html2canvas';

const nanoid = require('nanoid')

class Draggable extends React.Component {
  constructor(props) {
    super(props);
  
    this.updateRender = this.updateRender.bind(this);
    this.element = React.createRef();
    this.state = {
      enabled: false
    };
  }

  updateRender() {
    html2canvas(this.element.current, {logging: false}).then(bitmap => {
      this.bitmap = bitmap.toDataURL();
    });
  }

  componentDidMount() {
    this.id = nanoid();
    this.setState({ enabled: true });
    window.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("bm", this.bitmap);
    });
    this.updateRender()
  }

  render() {
    if (this.bitmap && this.element.current) {
      this.updateRender();
    }
    return (
      <span ref={this.element} draggable={this.state.enabled ? "true" : "false"} className="hoverEl" id={this.id}>
        {this.props.children}
      </span>
    );
  }
}

export default Draggable;